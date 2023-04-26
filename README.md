# p5.serialport

## About

WIP - concentric rings generated by heartbeats

## Dependencies
- NodeJS
- [P5.serialserver](https://github.com/p5-serial/p5.serialserver)

## Use

1. Connect PulseSensor to Arduino (Red - 5V, Black - GND, Purple - A0).
2. Run a server using the companion library p5.serialserver: navigate to p5_serialserver folder on Terminal and start a server using the command `node startserver.js`. 
More at [https://github.com/p5-serial/p5.serialserver](https://github.com/p5-serial/p5.serialserver). 
3. Upload Arduino code at Arduino/pulseSensorServer.ino to write outputs on the serial port.
4. Go live [here](http://127.0.0.1:5500)! 

## Resources
Arduino with Pulse Sensor to browser connection: 
https://medium.com/@venegu.design/real-time-pulse-visualizer-fd407d389edb

## Other
- Arduino port is set to "/dev/tty.usbmodem101". 
- Heartrate values generally around 100-120. 

## To-Do
- [x] Make rings last longer
- [x] Change texture of rings based on other parameters
- [ ] Add patterns to the edge of the rings 
- [x] Make background more aesthetically pleasing
- [x] Alter threshold to account for general peak heartrate values 
- [ ] Adapt for touch screen(?)
- [x] Sound
- [x] Disappear when touched but save to show at end 
- [ ] Show actual p mirabilis images before disappearing or a tree ring etc. 
- [x] Replay rings that are currently frozen