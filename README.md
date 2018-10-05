# info_screen_1602
Screen 16x2 to show some short info
## Install systemd service
``bash
sudo cp infoscreen_16x2.service /etc/systemd/system/
cd /etc/systemd/system/
systemctl enable infoscreen_16x2.service
``
