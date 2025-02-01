import React, { Component } from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import Card from '../components/Card'; // Assuming Card is another component

class SolutionsScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      solutions: [
        {
          title: "Renewable Energy",
          content: "Switching to renewable energy sources like solar, wind, and hydro reduces carbon emissions."
        },
        {
          title: "Energy Efficiency",
          content: "Improving energy efficiency in homes, offices, and industries minimizes energy waste."
        },
        {
          title: "Reforestation",
          content: "Planting trees and preserving forests absorb CO2 and restore natural habitats."
        }
      ]
    };
  }

  renderSolutionCards = () => {
    return this.state.solutions.map((solution, index) => (
      <Card 
        key={index}
        title={solution.title}
        content={solution.content}
      />
    ));
  };

  render() {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Solutions to Combat Climate Change</Text>
        {this.renderSolutionCards()}
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f4f4f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
  },
});

export default SolutionsScreen;
