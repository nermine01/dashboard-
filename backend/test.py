import smtplib

server = smtplib.SMTP("smtp.gmail.com", 587)
server.starttls()
server.login("khalil.hannachi@retsci.com", "cviw fyba eola itjv")
server.sendmail(
    "khalil.hannachi@retsci.com",
    "nermine.haouala@gmail.com",
    "Subject: Test Email\n\nThis is a test email."
)
server.quit()
