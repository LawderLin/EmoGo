import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

const SENTIMENT_QUESTIONS = [
  {
    id: 1,
    question: '今天你的整體心情如何？',
    options: [
      { value: 1, label: '非常不好 😢' },
      { value: 2, label: '不好 😕' },
      { value: 3, label: '普通 😐' },
      { value: 4, label: '好 😊' },
      { value: 5, label: '非常好 😄' },
    ]
  }
];

export default function SentimentQuestionnaire({ onComplete }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const currentQuestion = SENTIMENT_QUESTIONS[currentQuestionIndex];

  const handleAnswer = (value) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);

    // 如果還有更多問題，移到下一題
    if (currentQuestionIndex < SENTIMENT_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // 完成問卷，計算平均分數
      const totalScore = Object.values(newAnswers).reduce((sum, score) => sum + score, 0);
      const averageScore = Math.round(totalScore / Object.keys(newAnswers).length);
      onComplete(averageScore);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>情感問卷調查</Text>
        
        <View style={styles.questionContainer}>
          <Text style={styles.questionNumber}>
            問題 {currentQuestionIndex + 1} / {SENTIMENT_QUESTIONS.length}
          </Text>
          
          <Text style={styles.questionText}>
            {currentQuestion.question}
          </Text>

          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.option,
                  answers[currentQuestion.id] === option.value && styles.selectedOption
                ]}
                onPress={() => handleAnswer(option.value)}
              >
                <Text style={[
                  styles.optionText,
                  answers[currentQuestion.id] === option.value && styles.selectedOptionText
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  questionContainer: {
    minHeight: 300,
  },
  questionNumber: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: '#007AFF',
    borderColor: '#005cbf',
  },
  optionText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#333',
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#fff',
  },
  progressContainer: {
    padding: 20,
    paddingTop: 10,
    backgroundColor: '#fff',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
});