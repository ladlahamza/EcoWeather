import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import Card from '../components/Card';

// Define a class component for the ActionsScreen
class ActionsScreen extends React.Component {
  // Constructor to initialize the component
  constructor(props) {
    super(props);

    // Encapsulated styles within the component
    this.styles = StyleSheet.create({
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
  }

  // Reusable method to render a Card component
  renderCard(title, content) {
    return <Card key={title} title={title} content={content} />;
  }

  // Render method to define the UI
  render() {
    return (
      <ScrollView contentContainerStyle={this.styles.container}>
        <Text style={this.styles.title}>What Can You Do?</Text>
        {this.renderCard(
          'Reduce Waste',
          "Practice the 3 R's: Reduce, Reuse, and Recycle. Properly dispose of waste to reduce environmental pollution."
        )}
        {this.renderCard(
          'Conserve Energy',
          'Turn off lights, use energy-efficient appliances, and minimize electricity consumption.'
        )}
        {this.renderCard(
          'Support Sustainability',
          'Buy from sustainable brands and support policies aimed at protecting the environment.'
        )}
      </ScrollView>
    );
  }
}

export default ActionsScreen;
