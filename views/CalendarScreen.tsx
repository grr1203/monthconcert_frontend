import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  getJWTHeaderFromLocalStorage,
  privateAxiosInstance,
} from '../services/axios.service';

function CalendarScreen({
  navigation,
}: NativeStackScreenProps<any>): React.JSX.Element {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [concertObject, setConcertObject] = useState<any>({});

  const getCalendar = async (year: number, month: number) => {
    const res = await privateAxiosInstance.get('/calendar', {
      params: {year, month},
      headers: await getJWTHeaderFromLocalStorage(),
    });
    console.log('[res data]', res.data);
    if (Object.keys(res.data.monthConcert).length > 0) {
      setConcertObject(res.data.monthConcert);
    }
  };

  useEffect(() => {
    try {
      // calendar api 호출 (check login token)
      const date = new Date();
      getCalendar(date.getFullYear(), date.getMonth() + 1);
    } catch (error) {
      // api 호출 실패 -> access token 갱신 실패 -> 로그인 화면으로 이동
      console.log('[error]', error);
      navigation.navigate('Login');
    }
  }, [navigation]);

  const goToPrevMonth = () => {
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    getCalendar(prevYear, prevMonth + 1);
    setCurrentMonth(prevMonth);
    setCurrentYear(prevYear);
  };
  const goToNextMonth = () => {
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    getCalendar(nextYear, nextMonth + 1);
    setCurrentMonth(nextMonth);
    setCurrentYear(nextYear);
  };

  const calendar = generateCalendar(currentYear, currentMonth);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const getDayColor = (dayIndex: number) => {
    switch (dayIndex) {
      case 0: // 일
        return '#ff6666';
      case 6: // 토
        return '#6666ff';
      default:
        return '#444444';
    }
  };
  const generateRandomColor = () => {
    const hue = Math.random(); // 0부터 1까지의 랜덤한 색상 결정
    const saturation = 0.45; // 채도
    const brightness = 0.65; // 명도

    const newColor = `hsl(${Math.floor(hue * 360)}, ${Math.floor(
      saturation * 100,
    )}%, ${Math.floor(brightness * 100)}%)`;

    return newColor;
  };

  return (
    <SafeAreaView style={{backgroundColor: Colors.lighter}}>
      <StatusBar
        barStyle={false ? 'light-content' : 'dark-content'}
        backgroundColor={Colors.lighter}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        nestedScrollEnabled={true}
        style={{backgroundColor: Colors.lighter}}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={goToPrevMonth}>
              <Text style={styles.headerIcon}>{'<'}</Text>
            </TouchableOpacity>
            <Text style={styles.headerMonth}>{`${currentMonth + 1}`}</Text>
            <TouchableOpacity onPress={goToNextMonth}>
              <Text style={styles.headerIcon}>{'>'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.weekHeader}>
            {weekDays.map((day, index) => (
              <TouchableOpacity key={index} style={styles.dayHeader}>
                <Text style={[styles.headerDay, {color: getDayColor(index)}]}>
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.calendar}>
            {calendar.map((week, index) => (
              <View key={index} style={styles.week}>
                {week.map((day, dayIndex) => {
                  // 날짜 없는 날
                  if (day === null) {
                    return (
                      <ScrollView
                        key={dayIndex}
                        style={[styles.day, styles.nullDay]}
                      />
                    );
                  }

                  // 요일 색 변경
                  const dayColor = getDayColor(
                    new Date(currentYear, currentMonth, day).getDay(),
                  );

                  return (
                    <ScrollView key={dayIndex} style={styles.day}>
                      <Text style={[styles.dayText, {color: dayColor}]}>
                        {day}
                      </Text>
                      {concertObject[day] &&
                        concertObject[day].map(
                          (concert: any, concertIndex: number) => {
                            return (
                              <TouchableOpacity
                                onPress={() =>
                                  navigation.navigate('InstagramWebView', {
                                    postingUrl: concert.posting_url,
                                  })
                                }
                                key={concertIndex}
                                style={[styles.artistContainer]}>
                                <Image
                                  source={require('../assets/image/artistNameBackground.png')}
                                  style={[
                                    styles.artistBackground,
                                    {tintColor: generateRandomColor()},
                                  ]}
                                />
                                <View style={styles.artistOverlay}>
                                  <Text style={styles.artistText}>
                                    {concert.artist_name}
                                  </Text>
                                </View>
                              </TouchableOpacity>
                            );
                          },
                        )}
                    </ScrollView>
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
export default CalendarScreen;

const fontFamily = 'Pretendard-Regular'; // UhBeeZZIBA-Regular
const fontWeight = '600';
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    width: '95%',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerMonth: {
    fontFamily,
    fontSize: 60,
    fontWeight,
    color: '#222222',
  },
  headerIcon: {
    fontFamily,
    fontSize: 22,
    color: '#888888',
  },
  calendar: {
    flexDirection: 'column',
    width: '100%',
  },
  week: {
    flexDirection: 'row',
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 10,
    width: '100%',
  },
  dayHeader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  headerDay: {
    fontFamily,
    fontSize: 15,
    fontWeight,
  },
  nullDay: {
    backgroundColor: '#eee',
  },
  day: {
    width: '14.2857%',
    padding: 5,
    borderWidth: 0.5,
    borderColor: '#eaeaea',
    height: 85,
  },
  dayText: {
    fontFamily,
    paddingBottom: 2,
    fontWeight,
  },
  artistContainer: {
    flex: 1,
    position: 'relative',
    height: 20,
    marginBottom: 4,
  },
  artistBackground: {
    width: '100%',
    height: '100%',
  },
  artistOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 9,
  },
  artistText: {
    fontFamily: 'Pretendard-Regular',
    fontWeight,
    fontSize: 13,
    color: '#FFFFFF',
  },
});

const daysInMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();

const generateCalendar = (year: number, month: number) => {
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const totalDays = daysInMonth(year, month);
  const calendar = [];

  let dayCounter = 1;
  for (let i = 0; i < 6; i++) {
    const week = [];
    for (let j = 0; j < 7; j++) {
      if ((i === 0 && j < firstDayOfMonth) || dayCounter > totalDays) {
        week.push(null);
      } else {
        week.push(dayCounter);
        dayCounter++;
      }
    }
    calendar.push(week);
  }

  return calendar;
};
