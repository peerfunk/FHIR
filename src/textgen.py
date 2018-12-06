import sys
import codecs
from random import seed
from random import choice
from random import randint
import sys
import string
import glob
import os.path as pth


def getFilename(filename):
    filenum = 1
    while (pth.exists(filename+str(filenum)+".msg")):
           filenum+=1
    return filename+str(filenum)+".msg"
seed(1)
interval = None
delay = None

fileIN = sys.argv[1]
#fileIN = "testORIG.msg"
fileOUT = getFilename("testfile")

while(type(interval) is not int ):
    interval = int(input("Intervall (0-999):"))
while(type(delay) is not int ): #or delay > 99999 or delay <0
    delay = int(input("Delay nach jedem Intervall(0-99.999MS):"))

def writeEnd():
    with open(fileOUT, "a") as myfile:
        myfile.write(encode()) 
def encode():
    newcontents = str(interval) + "\n" + str(delay) +"\n"
    with open(fileIN,"r") as fileobj:
        for line in fileobj:  
           for ch in line:
               if(ch is "$"):
                   newcontents += str(randint(0,9))
               elif(ch is "§"):
                   newcontents += choice(string.ascii_letters)
               else:
                   newcontents  += ch
    return newcontents
writeEnd()



