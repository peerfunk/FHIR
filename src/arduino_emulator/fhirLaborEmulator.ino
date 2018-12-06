

 
#include <SPI.h>
#include <SD.h>
#include <String.h>
// include the library code:
#include <LiquidCrystal.h>


File root;
File curFile;
// initialize the library with the numbers of the interface pins
LiquidCrystal lcd(8, 9, 4, 5, 6, 7);

void setup() {
  Serial.begin(115200);
  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB port only
  }
  // set up the LCD's number of columns and rows:
  lcd.begin(16, 2);
  // Print a message to the LCD.
 initial();
 }

void loop() {

}

void initial(){
    lcd.setCursor(0,0);
   if (!SD.begin(10)) {
      lcd.print("Initialization");       
      lcd.setCursor(0,1);
      lcd.print("failed!");   
    return;
  }
  root = SD.open("/");
  printDirectory(root);
  
}

void printDirectory(File dir) {
  int x;
  int iterations=0;
  int sleep=0;
  
  File curfile;
  
  lcd.clear();
  lcd.print("READY!");
  while(true) {

  lcd.setCursor(0,0);
  x = analogRead (0); 
     
      if (x < 60) {
    //lcd.print ("Right ");
  }
  else if (x < 200) {
   // lcd.print ("Up    ");
  }
  else if (x < 400){
    iterations=0;
    sleep=0;
    lcd.setCursor(0,0);
    lcd.clear();
     File entry;
    entry =  dir.openNextFile();
     if (! entry) {
       // no more files
       // return to the first file in the directory
       dir.rewindDirectory();
     }
     curfile = entry;
     //iterations = getIterations(curfile );
     File x = SD.open(curfile.name(), FILE_READ);
     iterations = curfile.readStringUntil('\n').toInt();
     sleep =curfile.readStringUntil('\n').toInt();
    lcd.print(entry.name());
    lcd.setCursor(0,1);
    lcd.print("I:");
    lcd.print(iterations);
    lcd.print("x D:");
    lcd.print(sleep);
    lcd.print("MS");
    entry.close();
    delay(200);
      
  }
  else if (x < 600){
    //lcd.print ("Left  ");
  }
  else if (x < 800){
    curfile.openNextFile();
    selectFile(curfile,iterations, sleep);
    delay(200);
  }
  }
}

int getIterations(File cur){
  String inString = "";
  int value =0;
  File myFile = SD.open(cur.name(), FILE_READ);
  if (myFile && myFile.size()>4) {
    for(int i=0; i<4;++i){
      char inChar = myFile.read();
      Serial.print(inChar);
      if(isDigit(inChar)){
       inString += (char) inChar;
      }
    }
    value = (inString.toInt());
    Serial.println(inString);
    myFile.close();
  }
  return value;
}


int getDelay(File cur){
  String inString = "";
  int value =0;
  
  File myFile = SD.open(cur.name(), FILE_READ);
  if (myFile && myFile.size()>11) {
    myFile.seek(5);
    for(int i=0; i<6;++i){
      char inChar = myFile.read();
      if(isDigit(inChar)){
       inString += (char) inChar;
      }
    }
    value = (inString.toInt());
   myFile.close();
  }
  
  
   return value;
}

void selectFile(File cur,int iterations,int sleep){
  File myFile = SD.open(cur.name(), FILE_READ);
  
   for(int i = 0; i < iterations; i++){
  lcd.clear();
  lcd.setCursor(0,0);
  lcd.print("Sending ");
  lcd.print( i+1 );
  myFile.readStringUntil('\n');
  myFile.readStringUntil('\n');
  
   //myFile.seek(12);
  if (myFile) {
    while ( myFile.available() && !myFile.isDirectory()) {
     Serial.write(myFile.read());
    }
    Serial.println();
  
  }
  delay(sleep);
   }

   lcd.clear();
   lcd.setCursor(0,0);
   lcd.print(myFile.name());
    lcd.setCursor(0,1);
    lcd.print("I:");
    lcd.print(iterations);
    lcd.print("x D:");
    lcd.print(sleep);
    lcd.print("MS");
     myFile.close();
}

