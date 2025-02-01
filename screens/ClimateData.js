import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  FlatList,
  Share,
} from 'react-native';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LineChart } from 'react-native-chart-kit';
import * as Animatable from 'react-native-animatable';
import MapView, { Marker } from 'react-native-maps';
import * as Notifications from 'expo-notifications';

// Climate data API
const OPEN_WEATHER_API_KEY = '755d56637be37bccfa901f54603d2cae';
const OPENCAGE_API_KEY = 'a3755b9035f54439a4cf16c9f638edf3';

// Geocoding API class
class GeocodeAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async getCoordinates(location) {
    const geocodeUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=${this.apiKey}`;
    const response = await fetch(geocodeUrl);
    const data = await response.json();
    return data;
  }
}

// Climate data API class
class ClimateDataAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async getClimateData(latitude, longitude, startDate, endDate) {
    const NASA_API_URL = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,PRECTOTCORR,WS10M,RH2M&latitude=${latitude}&longitude=${longitude}&start=${startDate.toISOString().slice(0, 10).replace(/-/g, '')}&end=${endDate.toISOString().slice(0, 10).replace(/-/g, '')}&format=JSON&community=AG`;
    const CORS_PROXY = 'https://api.allorigins.win/get?url=';
    const nasaApiUrl = `${CORS_PROXY}${encodeURIComponent(NASA_API_URL)}`;
    const response = await fetch(nasaApiUrl);
    const data = await response.json();
    return JSON.parse(data.contents);
  }
}

const ClimateData = () => {
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [climateData, setClimateData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);
  const [unit, setUnit] = useState('C'); // 'C' for Celsius, 'F' for Fahrenheit
  const [mapVisible, setMapVisible] = useState(false);
  const [filter, setFilter] = useState({ minTemp: null, maxTemp: null, minPrecip: null, maxPrecip: null });
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Date picker visibility state
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const geocodeAPI = new GeocodeAPI(OPENCAGE_API_KEY);
  const climateDataAPI = new ClimateDataAPI(OPEN_WEATHER_API_KEY);

  // Handle date change
  const handleDateChange = (event, selectedDate, setDate, setShowPicker) => {
    const currentDate = selectedDate || new Date();
    setShowPicker(false);
    setDate(currentDate);
  };

  // Fetch climate data
  const fetchClimateData = async () => {
    if (!location || !startDate || !endDate) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');
    setClimateData(null);

    try {
      const geocodeData = await geocodeAPI.getCoordinates(location);

      if (!geocodeData.results.length) {
        setError('Location not found. Please try again.');
        setLoading(false);
        return;
      }

      const latitude = geocodeData.results[0].geometry.lat;
      const longitude = geocodeData.results[0].geometry.lng;
      setCoordinates(`Latitude: ${latitude.toFixed(4)}, Longitude: ${longitude.toFixed(4)}`);

      const climateDataResponse = await climateDataAPI.getClimateData(latitude, longitude, startDate, endDate);

      if (!climateDataResponse || !climateDataResponse.properties || !climateDataResponse.properties.parameter) {
        setError('No valid historical climate data available.');
        setLoading(false);
        return;
      }

      const dates = Object.keys(climateDataResponse.properties.parameter.T2M);
      const results = dates.map((date) => ({
        date,
        temperature: climateDataResponse.properties.parameter.T2M[date] !== -999 ? climateDataResponse.properties.parameter.T2M[date] : 'N/A',
        precipitation: climateDataResponse.properties.parameter.PRECTOTCORR[date] !== -999 ? climateDataResponse.properties.parameter.PRECTOTCORR[date] : 'N/A',
        windSpeed: climateDataResponse.properties.parameter.WS10M[date] !== -999 ? (climateDataResponse.properties.parameter.WS10M[date] * 3.6).toFixed(2) : 'N/A',
        humidity: climateDataResponse.properties.parameter.RH2M[date] !== -999 ? climateDataResponse.properties.parameter.RH2M[date] : 'N/A',
      }));

      setClimateData(results);
      setSearchHistory((prev) => [location, ...prev.slice(0, 4)]);
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
    } catch (error) {
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchClimateData();
  };

  // Save location to favorites
  const saveToFavorites = () => {
    if (location && !favorites.includes(location)) {
      setFavorites([...favorites, location]);
    }
  };

  // Share climate data
  const shareData = async () => {
    try {
      await Share.share({
        message: `Check out this climate data for ${location}: ${JSON.stringify(climateData)}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Filter climate data
  const filteredData = climateData
    ? climateData.filter((data) => {
        const temp = parseFloat(data.temperature);
        const precip = parseFloat(data.precipitation);
        return (
          (!filter.minTemp || temp >= filter.minTemp) &&
          (!filter.maxTemp || temp <= filter.maxTemp) &&
          (!filter.minPrecip || precip >= filter.minPrecip) &&
          (!filter.maxPrecip || precip <= filter.maxPrecip)
        );
      })
    : [];

  // Convert temperature based on unit
  const convertTemperature = (temp) => {
    if (unit === 'F') {
      return ((temp * 9) / 5 + 32).toFixed(2);
    }
    return temp.toFixed(2);
  };

  // Toggle temperature unit
  const toggleUnit = () => {
    setUnit(unit === 'C' ? 'F' : 'C');
  };

  // Prepare graph data
  const graphData = {
    labels: climateData ? climateData.map((data) => data.date.slice(6, 8)) : [],
    datasets: [
      {
        data: climateData ? climateData.map((data) => parseFloat(data.temperature)) : [],
        color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🌍 Climate Data Search 🌤️</Text>
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter location (e.g., Jhang)"
            placeholderTextColor="#888"
            value={location}
            onChangeText={setLocation}
          />
          <TouchableOpacity onPress={() => setShowHistoryDropdown(!showHistoryDropdown)}>
            <FontAwesome5 name="history" size={24} color="#3498db" />
          </TouchableOpacity>
        </View>

        

        {/* Date Pickers */}
        <View style={styles.datePickerContainer}>
          <Text style={styles.dateLabel}>Start Date: {startDate.toLocaleDateString()}</Text>
          <Button title="Select Start Date" onPress={() => setShowStartDatePicker(true)} />
          {showStartDatePicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) =>
                handleDateChange(event, selectedDate, setStartDate, setShowStartDatePicker)
              }
            />
          )}
        </View>

        <View style={styles.datePickerContainer}>
          <Text style={styles.dateLabel}>End Date: {endDate.toLocaleDateString()}</Text>
          <Button title="Select End Date" onPress={() => setShowEndDatePicker(true)} />
          {showEndDatePicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) =>
                handleDateChange(event, selectedDate, setEndDate, setShowEndDatePicker)
              }
            />
          )}
        </View>

        {/* Fetch Data Button */}
        <TouchableOpacity style={styles.fetchButton} onPress={fetchClimateData}>
          <Text style={styles.fetchButtonText}>Fetch Data</Text>
        </TouchableOpacity>

        {/* Loading Indicator */}
        {loading && <ActivityIndicator size="large" color="#3498db" style={styles.loader} />}

        {/* Error Message */}
        {error && (
          <Animatable.View animation="fadeIn" style={styles.errorContainer}>
            <FontAwesome5 name="exclamation-circle" size={24} color="#ff6b6b" />
            <Text style={styles.error}>{error}</Text>
            <Button title="Retry" onPress={fetchClimateData} color="#ff6b6b" />
          </Animatable.View>
        )}

        {/* Coordinates */}
        {coordinates && <Text style={styles.coordinates}>{coordinates}</Text>}

        {/* Map */}
        {mapVisible && coordinates && (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: parseFloat(coordinates.split(',')[0].split(':')[1].trim()),
              longitude: parseFloat(coordinates.split(',')[1].split(':')[1].trim()),
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
          >
            <Marker
              coordinate={{
                latitude: parseFloat(coordinates.split(',')[0].split(':')[1].trim()),
                longitude: parseFloat(coordinates.split(',')[1].split(':')[1].trim()),
              }}
              title={location}
            />
          </MapView>
        )}

        {/* Chart */}
        {climateData && climateData.length > 0 && (
          <Animatable.View animation="fadeIn" style={styles.chartContainer}>
            <ScrollView horizontal>
              <LineChart
                data={graphData}
                width={Dimensions.get('window').width * 2}
                height={250}
                chartConfig={{
                  backgroundColor: '#fff',
                  backgroundGradientFrom: '#fff',
                  backgroundGradientTo: '#fff',
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                }}
                bezier
              />
            </ScrollView>
          </Animatable.View>
        )}

        {/* Results */}
        <View style={styles.results}>
          {filteredData.map((data, index) => (
            <Animatable.View
              key={index}
              animation="fadeInUp"
              delay={index * 100}
              style={styles.card}
            >
              <Text style={styles.cardTitle}>
                {data.date.slice(0, 4)}-{data.date.slice(4, 6)}-{data.date.slice(6, 8)}
              </Text>
              <View style={styles.cardItemContainer}>
                <FontAwesome5 name="temperature-low" size={20} color="#e74c3c" />
                <Text style={styles.cardItem}>
                  Temperature: {convertTemperature(data.temperature)}°{unit}
                </Text>
                <TouchableOpacity onPress={toggleUnit} style={styles.unitToggle}>
                  <Text style={styles.unitToggleText}>Switch to {unit === 'C' ? 'F' : 'C'}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.cardItemContainer}>
                <FontAwesome5 name="cloud-rain" size={20} color="#3498db" />
                <Text style={styles.cardItem}>Precipitation: {data.precipitation} mm</Text>
              </View>
              <View style={styles.cardItemContainer}>
                <FontAwesome5 name="wind" size={20} color="#2ecc71" />
                <Text style={styles.cardItem}>Wind Speed: {data.windSpeed} km/h</Text>
              </View>
              <View style={styles.cardItemContainer}>
                <FontAwesome5 name="tint" size={20} color="#9b59b6" />
                <Text style={styles.cardItem}>Humidity: {data.humidity} %</Text>
              </View>
            </Animatable.View>
          ))}
        </View>
      </ScrollView>

      {/* Refresh Button */}
      <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
        <FontAwesome5 name="sync" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Save to Favorites Button */}
      <TouchableOpacity style={styles.favoriteButton} onPress={saveToFavorites}>
        <MaterialIcons name="favorite" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Share Button */}
      <TouchableOpacity style={styles.shareButton} onPress={shareData}>
        <FontAwesome5 name="share-alt" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    color: '#333',
    backgroundColor: '#fff',
    marginRight: 10,
  },
  datePickerContainer: {
    marginBottom: 15,
  },
  dateLabel: {
    color: '#333',
    marginBottom: 5,
  },
  fetchButton: {
    backgroundColor: '#3498db',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  fetchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 20,
  },
  errorContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  error: {
    color: '#ff6b6b',
    marginTop: 10,
    textAlign: 'center',
  },
  coordinates: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#333',
    marginTop: 10,
  },
  chartContainer: {
    marginTop: 20,
    paddingBottom: 40,
  },
  historyDropdown: {
    maxHeight: 150,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  historyItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  historyText: {
    color: '#333',
    fontSize: 16,
  },
  results: {
    marginTop: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  cardItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardItem: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  unitToggle: {
    marginLeft: 'auto',
    backgroundColor: '#3498db',
    borderRadius: 5,
    padding: 5,
  },
  unitToggleText: {
    color: '#fff',
    fontSize: 12,
  },
  refreshButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#3498db',
    borderRadius: 30,
    padding: 15,
  },
  favoriteButton: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    backgroundColor: '#e74c3c',
    borderRadius: 30,
    padding: 15,
  },
  shareButton: {
    position: 'absolute',
    bottom: 160,
    right: 20,
    backgroundColor: '#2ecc71',
    borderRadius: 30,
    padding: 15,
  },
  map: {
    height: 200,
    marginVertical: 20,
    borderRadius: 10,
  },
});

export default ClimateData;