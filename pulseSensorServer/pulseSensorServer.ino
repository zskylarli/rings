// Setup runs once
void setup() {
  Serial.begin(9600);
}

void loop() {
  int pulseSensor = analogRead(A0);
  int mappedPulseSensor = map(pulseSensor, 0, 1023, 0, 255);
  Serial.write(mappedPulseSensor);
  delay(10);
}
