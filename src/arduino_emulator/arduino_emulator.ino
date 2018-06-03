void setup() {
  Serial.begin(9600);
}
void loop() {
 //tested on rpi with: sudo cat /dev/serial0
 Serial.println("Name:  40BANDEL");
 Serial.println("ID:    40");
 Serial.println("Holder:");
 Serial.println("Specie:Dog");
 Serial.println("cCRP:  124.0 mg/l");
 Serial.println("Range: 0.0 - 10.0");
 Serial.println("Specie:Dog");
 Serial.println("Time:  13:01");
 Serial.println("Date:  21-01-2018");
 delay(1000);
}
