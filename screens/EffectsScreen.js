import React, { Component } from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';
import Card from '../components/Card'; // Assuming Card is another component

class EffectsScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      effects: [
        {
          title: "Rising Temperatures",
          content: "Global temperatures are increasing, leading to more frequent heatwaves and extreme weather events."
        },
        {
          title: "Melting Ice and Rising Seas",
          content: "Polar ice caps and glaciers are melting, causing sea levels to rise and threatening coastal regions."
        },
        {
          title: "Disrupted Ecosystems",
          content: "Habitats are changing rapidly, endangering species and leading to biodiversity loss."
        }
      ]
    };
  }

  renderEffectCards = () => {
    return this.state.effects.map((effect, index) => (
      <Card
        key={index}
        title={effect.title}
        content={effect.content}
      />
    ));
  };

  render() {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Effects of Climate Change</Text>
        {this.renderEffectCards()}
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

export default EffectsScreen;
