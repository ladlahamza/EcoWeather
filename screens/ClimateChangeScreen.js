import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  ImageBackground,
  TextInput,
} from 'react-native';
import Card from '../components/Card';
import Button from '../components/Button';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';

export default function ClimateChangeScreen() {
  const [sections, setSections] = useState({
    climateChange: false,
    effects: false,
    solutions: false,
    actions: false,
  });
  const [searchQuery, setSearchQuery] = useState('');

  const navigation = useNavigation();

  const toggleSection = (section) => {
    setSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header with Search Bar */}
      <ImageBackground
        source={require('../assets/climate-bg.jpg')} // Add a background image
        style={styles.header}
        imageStyle={styles.headerBackground}
      >
        <Text style={styles.headerTitle}>Climate Action Hub</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search topics..."
            placeholderTextColor="#ccc"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Icon name="search" size={20} color="#ccc" style={styles.searchIcon} />
        </View>
      </ImageBackground>

      {/* Navigation Buttons */}
      <View style={styles.navContainer}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('TodayData')}
        >
          <Icon name="bar-chart" size={24} color="#fff" />
          <Text style={styles.navText}>Today Data</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('ClimateData')}
        >
          <Icon name="line-chart" size={24} color="#fff" />
          <Text style={styles.navText}>Climate Data</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('AIScreen')}
        >
          <Icon name="android" size={24} color="#fff" />
          <Text style={styles.navText}>AI Assistant</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Tracker */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressTitle}>Your Climate Action Progress</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '45%' }]} />
        </View>
        <Text style={styles.progressText}>45% Completed</Text>
      </View>

      {/* What is Climate Change */}
      <View style={styles.section}>
        <View style={styles.titleContainer}>
          <Icon name="globe" size={28} color="#28a745" />
          <Text style={styles.title}>What is Climate Change?</Text>
        </View>
        <Card
          title="Defining Climate Change"
          content="Climate change refers to long-term shifts in temperature, precipitation, and other atmospheric conditions. It's primarily caused by human activities."
          icon={<Icon name="thermometer-full" size={24} color="#ff6b6b" />}
        />
        {!sections.climateChange ? (
          <Button text="Read More" onPress={() => toggleSection('climateChange')} />
        ) : (
          <Animated.View style={styles.moreText}>
            <Text style={styles.text}>
              Human activities, particularly the burning of fossil fuels like coal, oil, and natural gas, have significantly raised the levels of greenhouse gases like carbon dioxide (CO2) in the atmosphere.
            </Text>
            <Text style={styles.text}>
              Deforestation and industrial processes also contribute to the accumulation of these gases, resulting in the warming of the Earth's climate.
            </Text>
            <Button text="Hide" onPress={() => toggleSection('climateChange')} />
          </Animated.View>
        )}
      </View>

      {/* Effects of Climate Change */}
      <View style={styles.section}>
        <View style={styles.titleContainer}>
          <Icon name="tint" size={28} color="#1e90ff" />
          <Text style={styles.title}>Effects of Climate Change</Text>
        </View>
        <Card
          title="Rising Sea Levels"
          content="Melting ice caps and glaciers are causing sea levels to rise, leading to flooding in coastal areas."
          icon={<Icon name="leaf" size={24} color="#28a745" />}
        />
        <Card
          title="Extreme Weather Events"
          content="Climate change is causing more frequent and severe storms, heatwaves, and droughts."
          icon={<Icon name="thermometer-half" size={24} color="#ffa500" />}
        />
        <Card
          title="Ocean Acidification"
          content="Increased CO2 levels are also leading to more acidic oceans, affecting marine life and ecosystems."
          icon={<Icon name="cloud" size={24} color="#87ceeb" />}
        />
        {!sections.effects ? (
          <Button text="Read More" onPress={() => toggleSection('effects')} />
        ) : (
          <Animated.View style={styles.moreText}>
            <Text style={styles.text}>
              The rise in global temperatures is causing disruptions in ecosystems and more extreme weather patterns. The warming of the oceans and the increase in wildfires are additional signs of these changes.
            </Text>
            <Text style={styles.text}>
              The increase in frequency of extreme weather events, such as hurricanes and floods, is affecting communities globally. Immediate action is necessary to slow these changes.
            </Text>
            <Button text="Hide" onPress={() => toggleSection('effects')} />
          </Animated.View>
        )}
      </View>

      {/* News Section */}
      <View style={styles.section}>
        <View style={styles.titleContainer}>
          <Icon name="newspaper-o" size={28} color="#9370db" />
          <Text style={styles.title}>Latest Climate News</Text>
        </View>
        <Card
          title="Global Summit on Climate Change"
          content="World leaders gather to discuss urgent actions needed to combat climate change."
          icon={<Icon name="globe" size={24} color="#1e90ff" />}
        />
        <Card
          title="Renewable Energy Breakthrough"
          content="Scientists develop a new solar panel technology that doubles energy efficiency."
          icon={<Icon name="sun-o" size={24} color="#ffd700" />}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f4f4f9',
    paddingBottom: 20,
  },
  header: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerBackground: {
    opacity: 0.8,
    borderRadius: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  searchIcon: {
    marginLeft: 10,
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    backgroundColor: '#28a745',
    flex: 1,
    marginHorizontal: 5,
    justifyContent: 'center',
  },
  navText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 10,
  },
  progressContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#28a745',
  },
  progressText: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
  section: {
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  moreText: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  text: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
    marginBottom: 15,
  },
});