import React, {useState, useEffect} from 'react';
import {
  View,
  SafeAreaView,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  Image,
  ScrollView,
  ActivityIndicator,
  Button,
} from 'react-native';

import ImagePicker from 'react-native-image-crop-picker';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import DatePicker from 'react-native-datepicker';
import storage from '@react-native-firebase/storage';
import {ProgressBar, Colors} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as yup from 'yup';
import {Formik} from 'formik';

import FormInput from '../../components/FormInput';

function EditProfile({navigation}) {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [transferred, setTransferred] = useState(0);

  const [loading, setLoading] = useState(false);

  const Camera = () => {
    ImagePicker.openCamera({
      compressImageMaxWidth: 300,
      compressImageMaxHeight: 300,
      cropping: true,
      compressImageQuality: 0.7,
    }).then(image => {
      console.log(image);
      const imageUri = Platform.OS === 'ios' ? image.sourceURL : image.path;
      setImage(imageUri);
    });
  };

  const PickImage = () => {
    ImagePicker.openPicker({
      width: 300,
      height: 300,
      cropping: true,
      compressImageQuality: 0.7,
    }).then(image => {
      console.log(image);
      const imageUri = Platform.OS === 'ios' ? image.sourceURL : image.path;
      setImage(imageUri);
    });
  };
  const uploadImage = async () => {
    const uri = image;

    const filename = uri.substring(uri.lastIndexOf('/') + 1);
    // const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
    console.log('filename', filename);
    // console.log('uploadUri', uploadUri);
    setUploading(true);
    setTransferred(0);

    const storageRef = storage().ref(`userprofile/${auth().currentUser.uid}`);
    const task = storageRef.putFile(uri);

    const taskProgress = snapshot => {
      setTransferred(
        Math.round(snapshot.bytesTransferred / snapshot.totalBytes) * 10000,
      );
    };

    const taskError = snapshot => {
      //to check the error
      console.log(snapshot);
    };

    task.on('state_changed', taskProgress, taskError);

    try {
      await task;

      const url = storageRef.getDownloadURL();

      setUploading(false);
      setImage(null);

      Alert.alert('Photo uploaded!', 'Your photo has been uploaded !');

      return url;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const submitpost = async () => {
    const imageurl = await uploadImage();
    console.log('imageurl: ' + imageurl);
    firestore()
      .collection('Discountusers')
      .doc(auth().currentUser.uid)
      .update({
        createdAt: firestore.Timestamp.fromDate(new Date()),
        userImg: imageurl,
      })
      .catch(() => alert('profile pics not updated'));
  };

  const savePostData = async db => {
    setLoading(true);

    firestore()
      .collection('Discountusers')
      .doc(auth().currentUser.uid)
      .update({
        fname: db.name,
        lname: db.last,
        address: db.address,
        dob: db.dob,
        createdAt: firestore.Timestamp.fromDate(new Date()),
      })
      .then(() => navigation.navigate('ProfileScreen'))
      .catch(() => alert('profile  not updated'));
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {loading ? (
        <ActivityIndicator
          //visibility of Overlay Loading Spinner
          visible={loading}
          //Text with the Spinner
          textContent={'Loading...'}
          size="large"
          color="#D02824"
          //Text style of the Spinner Text
          textStyle={styles.spinnerTextStyle}
        />
      ) : (
        <View>
          <View flexDirection="row">
            <TouchableOpacity style={styles.selectButton} onPress={PickImage}>
              <Text style={styles.buttonText}>Pick an image</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.selectButton} onPress={Camera}>
              <Text style={styles.buttonText}>Open Camera</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.imageContainer}>
            {image !== null ? (
              <Image source={{uri: image}} style={styles.imageBox} />
            ) : null}
            {uploading ? (
              <View style={styles.progressBarContainer}>
                <ProgressBar
                  progress={transferred}
                  color="#D02824"
                  style={{width: 300}}
                />
              </View>
            ) : (
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={submitpost}>
                <Text style={styles.buttonText}>Upload image</Text>
              </TouchableOpacity>
            )}
          </View>
          <Formik
            initialValues={{
              name: '',
              last: '',
              address: '',
              dob: '',
            }}
            onSubmit={values => savePostData(values)}
            validationSchema={yup.object().shape({
              name: yup.string().required('Please, provide your name!'),
              last: yup.string().required('Please, provide last name!'),
              address: yup.string().required('Please, provide address!'),
              dob: yup.string().required('Please, provide date of birth!'),
            })}>
            {({
              values,
              handleChange,
              errors,
              setFieldTouched,
              touched,
              isValid,
              handleSubmit,
            }) => (
              <View>
                <View style={{flexDirection: 'row'}}>
                  <View style={{width: '50%'}}>
                    <FormInput
                      title="First Name"
                      value={values.name}
                      style={{width: '95%'}}
                      onChangeText={handleChange('name')}
                      onBlur={() => setFieldTouched('name')}
                      placeholderText="First Name"
                      autoCorrect={false}
                    />
                    {touched.name && errors.name && (
                      <Text style={{fontSize: 12, color: '#FF0D10'}}>
                        {errors.name}
                      </Text>
                    )}
                  </View>
                  <View style={{width: '50%'}}>
                    <FormInput
                      title="Last Name"
                      value={values.last}
                      onChangeText={handleChange('last')}
                      onBlur={() => setFieldTouched('last')}
                      placeholderText="Last Name"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    {touched.last && errors.last && (
                      <Text style={{fontSize: 12, color: '#FF0D10'}}>
                        {errors.last}
                      </Text>
                    )}
                  </View>
                </View>

                <FormInput
                  title="Address"
                  value={values.address}
                  onChangeText={handleChange('address')}
                  onBlur={() => setFieldTouched('address')}
                  placeholderText="B2-11/3, Sector - 3, Thane - 403821 "
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {touched.address && errors.address && (
                  <Text style={{fontSize: 12, color: '#FF0D10'}}>
                    {errors.address}
                  </Text>
                )}
                <Text style={styles.dob}>Date of Birth</Text>
                <DatePicker
                  style={{width: '100%', borderRadius: 10}}
                  date={values.dob}
                  mode="date"
                  placeholder="select date"
                  format="YYYY-MM-DD"
                  minDate="1900-05-01"
                  maxDate="2021-06-01"
                  confirmBtnText="Confirm"
                  cancelBtnText="Cancel"
                  customStyles={{
                    dateIcon: {
                      position: 'absolute',
                      left: 0,
                      top: 4,
                      marginLeft: 0,
                    },
                    dateInput: {},
                    dateText: {
                      color: '#fff',
                    },
                    // ... You can check the source to find the other keys.
                  }}
                  onDateChange={handleChange('dob')}
                />
                {touched.dob && errors.dob && (
                  <Text style={{fontSize: 12, color: '#FF0D10'}}>
                    {errors.dob}
                  </Text>
                )}
                {/* <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={savePostData}>
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity> */}
                <View style={{marginTop: 30}}>
                  <Button
                    color="#D02824"
                    title="Update Profile"
                    disabled={!isValid}
                    onPress={handleSubmit}
                  />
                </View>
              </View>
            )}
          </Formik>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#2C3A4A',
    padding: 20,
  },
  selectButton: {
    borderRadius: 5,
    width: 150,
    height: 50,
    backgroundColor: '#D02824',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  uploadButton: {
    borderRadius: 5,
    width: 150,
    height: 50,
    backgroundColor: '#D02824',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  imageContainer: {
    marginTop: 30,
    marginBottom: 50,
    alignItems: 'center',
  },
  progressBarContainer: {
    marginTop: 20,
  },
  imageBox: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  dob: {
    color: '#fff',
    fontSize: 20,
    marginTop: 15,
    marginBottom: 5,
  },
  spinnerTextStyle: {
    color: '#D02824',
  },
});

export default EditProfile;
