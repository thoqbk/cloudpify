cloudpify=`pwd`
cd "$cloudpify"/../test-cloudpify
testCloudpify=`pwd`
cd $cloudpify

#remove lib
cd "$testCloudpify"
zip -qr lib.zip lib
rm -rf "$testCloudpify"/lib
cp -r "$cloudpify"/lib "$testCloudpify"/lib

# run test
mocha
rm -rf lib
unzip -q lib.zip
rm lib.zip

#go back home
cd "$cloudpify"
