# info_screen_1602
Screen 16x2 to show some short info
## Install systemd service
```bash
sudo cp infoscreen_16x2.service /etc/systemd/system/
cd /etc/systemd/system/
sudo systemctl enable infoscreen_16x2.service
```
## See systemd service journal
```bash
journalctl -u infoscreen_16x2
```
## Debug in VSCode

on Raspberry pi

```bash
# stop systemd service first
sudo systemctl stop infoscreen_16x2.service
sudo node --inspect index.js
```

on your laptop

```bash
ssh -L 9221:localhost:9229 pi@raspberry_ip_address
```