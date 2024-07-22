import qrcode

#url buat code
myqr = qrcode.make("https://www.youtube.com/watch?v=IUQVO97zcE0")

#print image QR
myqr.save("QR_Code_generator/test1.png")
