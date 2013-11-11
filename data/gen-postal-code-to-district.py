#!/usr/bin/env python3

import csv
import io
import os.path
import json
import re
import zipfile

CSV_FILE = os.path.join(os.path.dirname(__file__), 'raw', 'fsa-to-csduid.csv')
ZIP_FILE = os.path.join(os.path.dirname(__file__), 'raw', 'elections-2013-section-vote-par-adresse.zip')
OUT_FILE = os.path.join(os.path.dirname(__file__), 'processed', 'district-to-postal-codes.json')

POSTAL_CODE_REGEX = re.compile('^[A-Z][0-9][A-Z][0-9][A-Z][0-9]$')
DIGITS = '0123456789'
LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

OVERRIDES = {
    'H3C4H5': '182', # ville-marie -- it's east of the 10
    'H2H1S8': '112', # plateau -- it's west of the train tracks
    'H1T3S2': '152', # St. Leonard -- this one is actually split: one voter is in 152, 0 voters in 134.
    'H1G3G3': '082'  # Montreal-Nord -- the other one is also Montreal-Nord but is wrong
}

class PostalCodeData:
    def __init__(self, postalCode):
        self.postalCode = postalCode
        self.districts = {}

    def add(self, district):
        if district not in self.districts:
            self.districts[district] = 0

        self.districts[district] += 1

    # Gets the district for this postal code.
    #
    # The original dataset has errors. We remove errors by assuming that
    # correct data overwhelms incorrect data. If a certain postal code maps to
    # two districts, the one with the greater number of entries wins.
    #
    # If it's a close call, this assumption is probably wrong, so we raise an
    # AssertionError.
    def getDistrict(self):
        if self.postalCode in OVERRIDES:
            return OVERRIDES[self.postalCode]

        bestDistrict = None
        bestCount = 0
        for district, count in self.districts.items():
            if count > bestCount:
                bestCount = count
                bestDistrict = district

        if bestCount / len(self.districts) < 0.95:
            raise AssertionError("Postal code %s has two candidate districts" % (self.postalCode,))

        return bestDistrict

def readPostalCodeToDistrict():
    postalCodeDatas = {} # Dict of postal code -> PostalCodeData (string)

    with zipfile.ZipFile(ZIP_FILE) as dir:
        filename = dir.namelist()[0]
        print('Reading %s from zipfile %s...' % (filename, ZIP_FILE))

        with dir.open(filename) as csvFile:
            wrapper = io.TextIOWrapper(csvFile, encoding='utf8')
            reader = csv.reader(wrapper, delimiter=';')
            headerRow = next(reader)

            postalCodeIndex = headerRow.index('AdrComplete2')
            districtIndex = headerRow.index('NoDistrict')

            for row in reader:
                postalCode = ''.join(row[postalCodeIndex].split(' ')[-2:])
                if POSTAL_CODE_REGEX.match(postalCode) is None:
                    continue
                district = row[districtIndex]

                if postalCode not in postalCodeDatas:
                    postalCodeDatas[postalCode] = PostalCodeData(postalCode)

                postalCodeDatas[postalCode].add(district)

    print('Finding best postal-code matches...')
    ret = {} # Dict of postal code -> PostalCodeData

    for postalCode, x in postalCodeDatas.items():
        district = x.getDistrict()
        ret[postalCode] = district

    return ret

# Returns a near-copy of dict, rewriting 6-letter postal codes to smaller ones.
#
# For instance, this:
#
#     { 'H2T1T1': '131' ... 'H2T1T9': '131' }
#
# will become:
#
#     { 'H2T1T': '131' }
def compressPostalCodeToDistrict(postalCodeToDistrict, lengthToCompress, fsasOutsideMontreal):
    ret = {}

    if lengthToCompress % 2 == 0:
        chars = DIGITS
    else:
        chars = LETTERS

    def allCodesStartingWith(partial):
        return [ partial + char for char in chars ]

    partialCodesToIgnore = set()
    partialCodesToExamine = set()

    for postalCode, district in postalCodeToDistrict.items():
        # If we already have information that a postal code cannot be compressed
        # or it might point outside Montreal, we should not compress any more.
        if len(postalCode) > lengthToCompress or postalCode[:3] in fsasOutsideMontreal:
            ret[postalCode] = district
            partialCode = postalCode[:lengthToCompress - 1]
            partialCodesToIgnore.add(partialCode)

    for postalCode, district in postalCodeToDistrict.items():
        partialCode = postalCode[:lengthToCompress - 1]
        if partialCode in partialCodesToIgnore:
            ret[postalCode] = district
        else:
            partialCodesToExamine.add(partialCode)

    for partialCode in partialCodesToExamine:
        isOneDistrict = True
        lastDistrict = None
        for postalCode in allCodesStartingWith(partialCode):
            if postalCode in postalCodeToDistrict:
                district = postalCodeToDistrict[postalCode]
                if lastDistrict is None:
                    lastDistrict = district

                if district != lastDistrict:
                    isOneDistrict = False
                    break

        if lastDistrict is not None:
            if isOneDistrict:
                print('Compressed postal codes starting with %s to district %s' % (partialCode, lastDistrict))
                ret[partialCode] = lastDistrict
            else:
                for postalCode in allCodesStartingWith(partialCode):
                    if postalCode in postalCodeToDistrict:
                        ret[postalCode] = postalCodeToDistrict[postalCode]

    return ret

def byDistrict(postalCodeToDistrict):
    districtToPostalCode = {}

    for postalCode, district in postalCodeToDistrict.items():
        if district not in districtToPostalCode:
            districtToPostalCode[district] = []

        districtToPostalCode[district].append(postalCode)

    for postalCodes in districtToPostalCode.values():
        postalCodes.sort()

    return districtToPostalCode

def main():
    data = readPostalCodeToDistrict()

    fsasOutsideMontreal = {}
    print('Adding Quebec-wide FSAs...')
    with open(CSV_FILE) as f:
        f.readline()
        for line in f:
            fsa, csduid = line.strip().split(',')
            district = csduid[2:]
            fsasOutsideMontreal[fsa] = district

    print('Compressing...')
    # Compress down to FSAs at best. We don't have enough data to go smaller.
    for i in range(6, 3, -1):
        data = compressPostalCodeToDistrict(data, i, fsasOutsideMontreal)

    print('Finalizing FSAs...')
    for fsa, district in fsasOutsideMontreal.items():
        data[fsa] = district

    print('Inverting...')
    data = byDistrict(data)

    with open(OUT_FILE, 'w') as outFile:
        print('Writing to %s...' % (OUT_FILE,))
        outFile.write(json.dumps(data))

if __name__ == '__main__':
    main()
