import React, { Component } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const API_KEY = '755d56637be37bccfa901f54603d2cae';

class TodayData extends Component {
  constructor(props) {
    super(props);
    this.state = {
      city: '',
      climate: null,
      forecast: [],
      loading: false,
      error: '',
      searchHistory: [],
      refreshing: false,
    };
  }

  fetchWeather = async () => {
    const { city } = this.state;

    if (!city.trim()) {
      this.setState({
        error: 'Please enter a city name.',
        climate: null,
      });
      return;
    }

    this.setState({ loading: true, error: '', climate: null, forecast: [] });

    try {
      const [weatherResponse, forecastResponse] = await Promise.all([
        fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        ),
        fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
        ),
      ]);

      if (!weatherResponse.ok || !forecastResponse.ok) {
        throw new Error(
          'City not found. Please check the spelling and try again.'
        );
      }

      const weatherData = await weatherResponse.json();
      const forecastData = await forecastResponse.json();

      const { name, main, weather, wind, sys } = weatherData;

      this.setState({
        climate: {
          name: `${name}, ${sys.country}`,
          temperature: main.temp,
          feelsLike: main.feels_like,
          humidity: main.humidity,
          windSpeed: wind.speed,
          description: weather[0].description,
          icon: `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`,
        },
        forecast: forecastData.list.slice(0, 5), // Get the next 5 days
        searchHistory: [
          `${name}, ${sys.country}`,
          ...this.state.searchHistory.slice(0, 4),
        ],
      });
    } catch (err) {
      this.setState({ error: err.message, climate: null });
    } finally {
      this.setState({ loading: false, refreshing: false });
    }
  };

  handleRefresh = () => {
    this.setState({ refreshing: true }, this.fetchWeather);
  };

  renderWeatherDetails = () => {
    const { climate, forecast } = this.state;

    if (!climate) return null;

    return (
      <ScrollView contentContainerStyle={styles.results}>
        <View style={styles.weatherCard}>
          <Text style={styles.cityName}>{climate.name}</Text>
          <View style={styles.weatherDescription}>
            <Image source={{ uri: climate.icon }} style={styles.weatherIcon} />
            <Text style={styles.descriptionText}>{climate.description}</Text>
          </View>

          <View style={styles.weatherDetails}>
            <View style={styles.detailItem}>
              <FontAwesome name="thermometer" size={32} color="#3498db" />
              <Text>{climate.temperature}°C</Text>
              <Text>Temperature</Text>
            </View>
            <View style={styles.detailItem}>
              <FontAwesome name="cloud" size={32} color="#3498db" />
              <Text>{climate.feelsLike}°C</Text>
              <Text>Feels Like</Text>
            </View>
            <View style={styles.detailItem}>
              <FontAwesome name="tint" size={32} color="#3498db" />
              <Text>{climate.humidity}%</Text>
              <Text>Humidity</Text>
            </View>
            <View style={styles.detailItem}>
              <FontAwesome name="wind" size={32} color="#3498db" />
              <Text>{climate.windSpeed} m/s</Text>
              <Text>Wind Speed</Text>
            </View>
          </View>
        </View>

        {/* 5-Day Forecast */}
        <Text style={styles.forecastTitle}>5-Day Forecast</Text>
        <View style={styles.forecastContainer}>
          {forecast.map((item, index) => (
            <View key={index} style={styles.forecastItem}>
              <Text style={styles.forecastDate}>
                {new Date(item.dt * 1000).toLocaleDateString()}
              </Text>
              <Image
                source={{
                  uri: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
                }}
                style={styles.forecastIcon}
              />
              <Text style={styles.forecastTemp}>{item.main.temp}°C</Text>
              <Text style={styles.forecastDescription}>
                {item.weather[0].description}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  renderSearchHistory = () => {
    const { searchHistory } = this.state;

    if (searchHistory.length === 0) return null;

    return (
      <View style={styles.historyContainer}>
        <Text style={styles.historyTitle}>Search History</Text>
        {searchHistory.map((city, index) => (
          <TouchableOpacity
            key={index}
            style={styles.historyItem}
            onPress={() => this.setState({ city }, this.fetchWeather)}
          >
            <Text style={styles.historyText}>{city}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  render() {
    const { city, loading, error, refreshing } = this.state;

    return (
      <View style={styles.container}>
        <Text style={styles.title}>🌍 Today's Climate 🌤️</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter city name"
            placeholderTextColor="#ccc"
            value={city}
            onChangeText={(text) => this.setState({ city: text })}
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={this.fetchWeather}
          >
            <FontAwesome name="search" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {loading && (
          <ActivityIndicator size="large" color="#fff" style={styles.loader} />
        )}
        {error && (
          <View style={styles.errorContainer}>
            <FontAwesome name="exclamation-circle" size={24} color="#ff6b6b" />
            <Text style={styles.error}>{error}</Text>
            <Button title="Retry" onPress={this.fetchWeather} color="#ff6b6b" />
          </View>
        )}

        {this.renderWeatherDetails()}
        {this.renderSearchHistory()}

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={this.handleRefresh}
        >
          <FontAwesome name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#4c669f', // Solid background color
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#fff',
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
    fontSize: 18,
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  searchButton: {
    marginLeft: 10,
    padding: 10,
    backgroundColor: '#3498db',
    borderRadius: 5,
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
  results: {
    marginTop: 20,
  },
  weatherCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  cityName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#fff',
  },
  weatherDescription: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  weatherIcon: {
    width: 70,
    height: 70,
    marginRight: 15,
  },
  descriptionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  weatherDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  forecastTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#fff',
  },
  forecastContainer: {
    marginBottom: 20,
  },
  forecastItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  forecastDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  forecastIcon: {
    width: 50,
    height: 50,
    marginVertical: 10,
  },
  forecastTemp: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  forecastDescription: {
    fontSize: 14,
    color: '#fff',
  },
  historyContainer: {
    marginTop: 20,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
  },
  historyItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 5,
    padding: 10,
    marginBottom: 5,
  },
  historyText: {
    fontSize: 16,
    color: '#fff',
  },
  refreshButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#3498db',
    borderRadius: 30,
    padding: 15,
  },
});

export default TodayData;