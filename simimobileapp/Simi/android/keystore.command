sudo keytool -genkey -v -keystore my-upload-key.keystore -alias upload-key-alias -keyalg RSA -keysize 2048 -validity 10000

view sha1 key for upload apk
keytool -exportcert -alias upload-key-alias -keystore  android/app/my-upload-key.keystore -list -v