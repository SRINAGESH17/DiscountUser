import React, {useCallback, memo, useRef, useState, useEffect} from 'react';
import {
  FlatList,
  View,
  Dimensions,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Modal from 'react-native-modal';
import LottieView from 'lottie-react-native';
import {useIsFocused} from '@react-navigation/native';
import TextLessMoreView from '../../components/TextLessMoreView';

const {width: windowWidth, height: windowHeight} = Dimensions.get('window');

const styles = StyleSheet.create({
  slide: {
    height: windowHeight * 0.4,
    width: windowWidth,
    backgroundColor: '#fff',
  },
  slideImage: {
    width: windowWidth,
    height: windowHeight * 0.4,
  },
  slideTitle: {
    position: 'absolute',
    top: windowHeight * 0.01,
    right: windowWidth * 0.2,
    width: windowWidth * 0.6,
    height: windowHeight * 0.05,
    alignItems: 'center',
  },
  slideSubtitle: {
    position: 'relative',
    left: windowWidth * 0.85,
  },
  back: {
    position: 'absolute',
    right: windowWidth * 0.88,
    top: windowHeight * 0.01,
  },

  pagination: {
    position: 'absolute',
    top: windowHeight * 0.35,
    width: '100%',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#D02824',
    width: 20,
  },
  paginationDotInactive: {backgroundColor: '#ECA9A7'},

  carousel: {flex: 1},
  container: {
    backgroundColor: '#fff',
    padding: 15,
    flex: 1.6,
  },
  txt: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 10,
  },
  txtproducts: {
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    margin: 5,
    padding: 5,
  },
  textCategory: {
    fontSize: 15,
  },
});

const slideList = Array.from({length: 4}).map((_, i) => {
  return {
    id: i,
    image: `https://picsum.photos/1440/2842?random=${i}`,
    title: 'Harish Stores',
  };
});

const value = [
  {
    value: '20% off on all the products of the store.',
  },
  {
    value: '30% off on all the products of the store.',
  },
  {
    value: '50% off on all the products of the store.',
  },
  {
    value: '10% off on all the products of the store.',
  },
  {
    value: '40% off on all the products of the store.',
  },
];

export default function StoreView({navigation, route}) {
  const [index, setIndex] = useState(0);

  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [discount, setdiscount] = useState('');
  const [discountText, setdiscountText] = useState('');

  const [userPost, setUserPosts] = useState([]);

  // Status
  const [Status, setStatus] = useState('');
  const [StatusValue, setStatusValue] = useState(null);
  // Category states

  //! category
  const [resturants, setResturants] = useState('');
  const [resturantsubcategory, setRestursetSubcategory] = useState('');
  const [clothesfootwear, setClothesFootwear] = useState('');
  const [personal, setPersonalCare] = useState('');
  const [demand, setdemand] = useState('');
  // daily Need
  const [dailyNeed, setDailyNeed] = useState('');
  const [medical, setMedical] = useState('');
  // home category
  const [repair, setRepair] = useState('');
  // medical category
  const [wedding, setWedding] = useState('');
  const [travel, setTravel] = useState('');
  const [fitness, setFitness] = useState('');

  const [shops, setshops] = useState('');
  const [education, seteducation] = useState('');

  //! end
  const [loading, setLoading] = useState(null);
  const [isModalVisible, setModalVisible] = useState(true);

  const indexRef = useRef(index);
  indexRef.current = index;
  const onScroll = useCallback(event => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);

    const distance = Math.abs(roundIndex - index);

    const isNoMansLand = distance > 0.4;

    if (roundIndex !== indexRef.current && !isNoMansLand) {
      setIndex(roundIndex);
    }
  }, []);

  const Slide = memo(function Slide({data}) {
    return (
      <>
        <Pressable
          onPress={() =>
            navigation.navigate('ViewImage', {
              url: data.imageurl,
            })
          }
          style={styles.slide}>
          <Image source={{uri: data.imageurl}} style={styles.slideImage} />
        </Pressable>
      </>
    );
  });
  function Pagination({index}) {
    return (
      <View style={styles.pagination} pointerEvents="none">
        {userPost.map((_, i) => {
          return (
            <View
              key={i}
              style={[
                styles.paginationDot,
                index === i
                  ? styles.paginationDotActive
                  : styles.paginationDotInactive,
              ]}
            />
          );
        })}
      </View>
    );
  }
  // const flatListOptimizationProps = {
  //   initialNumToRender: 0,
  //   maxToRenderPerBatch: 1,
  //   removeClippedSubviews: true,
  //   scrollEventThrottle: 16,
  //   windowSize: 2,
  //   keyExtractor: useCallback(s => String(s.id), []),
  //   getItemLayout: useCallback(
  //     (_, index) => ({
  //       index,
  //       length: windowWidth,
  //       offset: index * windowWidth,
  //     }),
  //     [],
  //   ),
  // };

  const renderItem = useCallback(function renderItem({item}) {
    return <Slide data={item} />;
  }, []);

  const uid = route.params;
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      setLoading(true);

      firestore()
        .collection('about')
        .doc(uid)
        .get()
        .then(documentSnapshot => {
          console.log('User data: ', documentSnapshot.data());
          setAbout(documentSnapshot.data().About);
        })
        .then(() => Post())
        .then(() => {
          setModalVisible(false);
          setLoading(false);
        });
    }
  }, [isFocused, uid]);

  function Post() {
    firestore()
      .collection('users')
      .doc(uid)
      .get()
      .then(documentSnapshot => {
        const userData = documentSnapshot.data();
        setContact(userData.contact);
      });
    firestore()
      .collection('StoreName')
      .doc(uid)
      .get()
      .then(documentSnapshot => {
        console.log('User exists: ', documentSnapshot.exists);
        if (documentSnapshot.exists === false) {
          setName('Add Name');
        }
        if (documentSnapshot.exists) {
          console.log('User data: ', documentSnapshot.data());
          setName(documentSnapshot.data().StoreName);
          setAddress(documentSnapshot.data().address);
          setdiscount(documentSnapshot.data().discount);
          setdiscountText(documentSnapshot.data().discountstatus);
        }
      });

    firestore()
      .collection('mystore')
      .doc(uid)
      .collection('userPosts')
      .orderBy('createdAt', 'asc')
      .get()
      .then(snapshot => {
        let posts = snapshot.docs.map(doc => {
          const data = doc.data();
          const id = doc.id;

          return {id, ...data};
        });
        // console.log('id of the post: ', posts);
        setUserPosts(posts);
      });

    // Status messages
    firestore()
      .collection('mystore')
      .doc(uid)
      .collection('status')
      .doc(uid)
      .get()
      .then(documentSnapshot => {
        if (documentSnapshot.exists === false) {
          setStatus('Close');
          setStatusValue(false);
        }
        if (documentSnapshot.exists) {
          setStatus(documentSnapshot.data().status);
          setStatusValue(documentSnapshot.data().value);
        }
      });
    // category section

    // fashion section
    firestore()
      .collection('mycategory')
      .doc(uid)
      .collection('Resturants')
      .doc(uid)
      .get()
      .then(documentSnapshot => {
        if (documentSnapshot.exists === false) {
          setResturants(null);
        }
        if (documentSnapshot.exists) {
          setResturants(documentSnapshot.data().restauranttype);
          setRestursetSubcategory(documentSnapshot.data().resturantcategory);
        }
      });
    firestore()
      .collection('mycategory')
      .doc(uid)
      .collection('clothesfootwear')
      .doc(uid)
      .get()
      .then(documentSnapshot => {
        if (documentSnapshot.exists === false) {
          setClothesFootwear(null);
        }
        if (documentSnapshot.exists) {
          setClothesFootwear(documentSnapshot.data().clothesfootwear);
        }
      });
    firestore()
      .collection('mycategory')
      .doc(uid)
      .collection('PersonalCare')
      .doc(uid)
      .get()
      .then(documentSnapshot => {
        if (documentSnapshot.exists === false) {
          setPersonalCare(null);
        }
        if (documentSnapshot.exists) {
          setPersonalCare(documentSnapshot.data().beauty);
        }
      });
    firestore()
      .collection('mycategory')
      .doc(uid)
      .collection('ondemand')
      .doc(uid)
      .get()
      .then(documentSnapshot => {
        if (documentSnapshot.exists === false) {
          setdemand(null);
        }
        if (documentSnapshot.exists) {
          setdemand(documentSnapshot.data().Demand);
        }
      });
    // footWear section
    firestore()
      .collection('mycategory')
      .doc(uid)
      .collection('DailyNeed')
      .doc(uid)
      .get()
      .then(documentSnapshot => {
        if (documentSnapshot.exists === false) {
          setDailyNeed(null);
        }
        if (documentSnapshot.exists) {
          setDailyNeed(documentSnapshot.data().DailyNeed);
        }
      });
    firestore()
      .collection('mycategory')
      .doc(uid)
      .collection('Medical')
      .doc(uid)
      .get()
      .then(documentSnapshot => {
        if (documentSnapshot.exists === false) {
          setMedical(null);
        }
        if (documentSnapshot.exists) {
          setMedical(documentSnapshot.data().medical);
        }
      });
    // home sectionTitle
    firestore()
      .collection('mycategory')
      .doc(uid)
      .collection('repair')
      .doc(uid)
      .get()
      .then(documentSnapshot => {
        if (documentSnapshot.exists === false) {
          setRepair(null);
        }
        if (documentSnapshot.exists) {
          setRepair(documentSnapshot.data().repair);
        }
      });
    // wedding
    firestore()
      .collection('mycategory')
      .doc(uid)
      .collection('wedding')
      .doc(uid)
      .get()
      .then(documentSnapshot => {
        if (documentSnapshot.exists === false) {
          setWedding(null);
        }
        if (documentSnapshot.exists) {
          setWedding(documentSnapshot.data().wedding);
        }
      });

    firestore()
      .collection('mycategory')
      .doc(uid)
      .collection('travel')
      .doc(uid)
      .get()
      .then(documentSnapshot => {
        if (documentSnapshot.exists === false) {
          setTravel(null);
        }
        if (documentSnapshot.exists) {
          setTravel(documentSnapshot.data().travel);
        }
      });

    firestore()
      .collection('mycategory')
      .doc(uid)
      .collection('fitness')
      .doc(uid)
      .get()
      .then(documentSnapshot => {
        if (documentSnapshot.exists === false) {
          setFitness(null);
        }
        if (documentSnapshot.exists) {
          setFitness(documentSnapshot.data().fitness);
        }
      });
    firestore()
      .collection('mycategory')
      .doc(auth().currentUser.uid)
      .collection('shops')
      .doc(auth().currentUser.uid)
      .get()
      .then(documentSnapshot => {
        if (documentSnapshot.exists === false) {
          setshops(null);
        }
        if (documentSnapshot.exists) {
          setshops(documentSnapshot.data().shops);
        }
      });
    firestore()
      .collection('mycategory')
      .doc(auth().currentUser.uid)
      .collection('education')
      .doc(auth().currentUser.uid)
      .get()
      .then(documentSnapshot => {
        if (documentSnapshot.exists === false) {
          seteducation(null);
        }
        if (documentSnapshot.exists) {
          seteducation(documentSnapshot.data().education);
        }
      });
  }

  const callNumber = () => {
    let phoneNumber = `tel:${contact}`;

    Linking.openURL(phoneNumber);
  };

  return (
    <>
      <View style={{flex: 0.2}}>
        <TouchableOpacity
          style={styles.back}
          onPress={() => navigation.goBack()}>
          <Image source={require('../../assets/back.png')} />
        </TouchableOpacity>
        <View style={styles.slideTitle}>
          <Text style={{fontSize: 15, color: '#000'}}>{name} Stores</Text>
        </View>
        {userPost.length === 0 ? (
          <View>
            <Text>Please upload the images</Text>
          </View>
        ) : null}
      </View>
      <Modal isVisible={isModalVisible}>
        <View style={{flex: 1}}>
          <Text>Hello!</Text>
        </View>
      </Modal>
      <FlatList
        data={userPost}
        style={styles.carousel}
        renderItem={renderItem}
        pagingEnabled
        horizontal
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={onScroll}
        keyExtractor={(item, index) => index.toString()}
      />

      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={{
            paddingBottom: windowHeight * 0.04,
          }}>
          {/* Grocery Store */}

          <View style={{marginTop: 10}}>
            <View flexDirection="row">
              <Text>Status</Text>
              <Text style={{marginStart: 20, color: '#008B3E'}}>
                {Status} now
              </Text>
            </View>
            <TouchableOpacity
              onPress={callNumber}
              style={{
                marginTop: 10,
                alignItems: 'center',
                flexDirection: 'row',
              }}>
              <Image source={require('../../assets/call.png')} />
              <Text
                style={{
                  borderWidth: 1,
                  padding: 10,
                  marginStart: 10,
                  width: 150,
                  borderColor: '#ccc',
                  borderRadius: 5,
                }}>
                +91 {contact}
              </Text>
            </TouchableOpacity>
          </View>
          {/* About the store */}
          <View style={{marginTop: 5}}>
            <Text style={styles.txt}>ABOUT THE STORE</Text>
            {/* <Text
              style={{
                borderWidth: 1,
                padding: 10,
                width: windowWidth * 0.92,
                borderColor: '#ccc',
                borderRadius: 5,
              }}>
              {about}
            </Text> */}
            <TextLessMoreView text={about} targetLines={2} />
          </View>
          {/* Discount on products */}

          <View style={{marginTop: 5}}>
            <Text style={styles.txt}>Discounts </Text>
            <Text
              style={{
                borderWidth: 1,
                padding: 10,
                width: windowWidth * 0.92,
                borderColor: '#ccc',
                borderRadius: 5,
              }}>
              {discount}% {discountText}
            </Text>
          </View>
          {/* Types of products */}
          <Text style={styles.txt}>Types Of Products</Text>
          <View
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 5,
              flexWrap: 'wrap',
              flexDirection: 'row',
              padding: 5,
            }}>
            {resturants === null ? null : (
              <View style={styles.txtproducts}>
                <Text style={styles.textCategory}>{resturants}</Text>
              </View>
            )}
            {clothesfootwear === null ? null : (
              <View style={styles.txtproducts}>
                <Text style={styles.textCategory}>{clothesfootwear}</Text>
              </View>
            )}
            {personal === null ? null : (
              <View style={styles.txtproducts}>
                <Text style={styles.textCategory}>{personal}</Text>
              </View>
            )}
            {demand === null ? null : (
              <View style={styles.txtproducts}>
                <Text style={styles.textCategory}>{demand}</Text>
              </View>
            )}
            {dailyNeed === null ? null : (
              <View style={styles.txtproducts}>
                <Text style={styles.textCategory}>{dailyNeed}</Text>
              </View>
            )}
            {medical === null ? null : (
              <View style={styles.txtproducts}>
                <Text style={styles.textCategory}>{medical}</Text>
              </View>
            )}
            {repair === null ? null : (
              <View style={styles.txtproducts}>
                <Text style={styles.textCategory}>{repair}</Text>
              </View>
            )}
            {wedding === null ? null : (
              <View style={styles.txtproducts}>
                <Text style={styles.textCategory}>{wedding}</Text>
              </View>
            )}

            {travel === null ? null : (
              <View style={styles.txtproducts}>
                <Text style={styles.textCategory}>{travel}</Text>
              </View>
            )}
            {fitness === null ? null : (
              <View style={styles.txtproducts}>
                <Text style={styles.textCategory}>{fitness}</Text>
              </View>
            )}
            {shops === null ? null : (
              <View style={styles.txtproducts}>
                <Text style={styles.textCategory}>{shops}</Text>
              </View>
            )}
            {education === null ? null : (
              <View style={styles.txtproducts}>
                <Text style={styles.textCategory}>{education}</Text>
              </View>
            )}
          </View>
          <Text style={styles.txt}>ADDRESS</Text>
          <View
            flexDirection="row"
            style={{marginTop: 10, alignItems: 'center'}}>
            <Image source={require('../../assets/map.png')} />
            <Text
              style={{
                borderWidth: 1,
                padding: 10,
                marginStart: 10,
                width: windowWidth * 0.84,
                borderColor: '#ccc',
                borderRadius: 5,
              }}>
              {address}
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.4}
            onPress={() =>
              navigation.navigate('rating', {ShpName: name, Shopid: uid})
            }
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#eee',
              padding: 10,
              marginTop: 10,
              borderRadius: 7,
            }}>
            <Text>Review and Rating</Text>
            <Text>{'>'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      <Pagination index={index} />
    </>
  );
}
