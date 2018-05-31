import os
import sys
import csv

    
class Reader:    
    def __init__(self,string):
        self.__string = string
        self.__read_config()
        self.process()
        #self.prnt()
    def __read_config(self):
        self.__definition = {}
        path = "vsight.csv"
        with open(path, 'r') as fileObj:
            file = csv.reader(fileObj, delimiter=';', quoting=csv.QUOTE_NONE)
            for row in file:
                self.__definition[row[0]]=row[1]
    def process(self):
        self.__values = {}
        charCounter=0
        for key in self.__definition.keys():
            self.__values[key]=self.__string[charCounter:charCounter+int(self.__definition[key])]
            charCounter+=int(self.__definition[key])
    def prnt(self):
        for key in self.__values.keys():
            print(key + " | "+str(self.__values[key]))
    def __str__(self):
        return (self.__values["ID"] + " data-len: " + str(len(self.__string)) )
            
def read_file(datasets):
    string = ""
    new = ['A','B','C']
    path = "vsight.txt"
    with open(path, 'r') as fileObj:
        for line in fileObj:
            for char in line:
                if (char in new and len(string) >1):
                    d=Reader(string)
                    datasets.append(d)
                    string=''
                string+=char
    d=Reader(string)
    datasets.append(d)

datasets = []
read_file(datasets)
for d in datasets:
        print("ID = " + str(d))
