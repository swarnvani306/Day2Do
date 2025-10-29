// App.js - Main App Component
import React, { useState, useEffect } from 'react';
import {
View,
Text,
StyleSheet,
StatusBar,
SafeAreaView,
ScrollView,
TextInput,
TouchableOpacity,
Alert,
Modal,
FlatList,
Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// Splash Screen Component
const SplashScreen = ({ onFinish }) => {
useEffect(() => {
const timer = setTimeout(() => {
onFinish();
}, 3000);
return () => clearTimeout(timer);
}, []);

return (
<View style={styles.splashContainer}>
<StatusBar barStyle="light-content" backgroundColor="#6366f1" />
<View style={styles.splashContent}>
<Text style={styles.appTitle}>Day2Do</Text>
<Text style={styles.appSubtitle}>AI-Powered Day Planning</Text>
<Text style={styles.appDescription}>
Dump your thoughts, align your day
</Text>
</View>
</View>
);
};

// Task Item Component
const TaskItem = ({ task, onToggle, onEdit, onDelete }) => {
return (
<View style={styles.taskItem}>
<TouchableOpacity onPress={() => onToggle(task.id)}>
<View style={[styles.checkbox, task.completed && styles.checkboxCompleted]}>
{task.completed && <Text style={styles.checkmark}>✓</Text>}
</View>
</TouchableOpacity>
<View style={styles.taskContent}>
<Text style={[styles.taskTitle, task.completed && styles.taskCompleted]}>
{task.title}
</Text>
<Text style={styles.taskTime}>
Est: {task.estimatedTime}min | Actual: {task.actualTime || 0}min
</Text>
<Text style={styles.taskPriority}>Priority: {task.priority}</Text>
</View>
<View style={styles.taskActions}>
<TouchableOpacity onPress={() => onEdit(task)} style={styles.actionButton}>
<Text style={styles.actionText}>Edit</Text>
</TouchableOpacity>
<TouchableOpacity onPress={() => onDelete(task.id)} style={styles.deleteButton}>
<Text style={styles.actionText}>Delete</Text>
</TouchableOpacity>
</View>
</View>
);
};

// Main App Component
const Day2DoApp = () => {
const [showSplash, setShowSplash] = useState(true);
const [tasks, setTasks] = useState([]);
const [thoughts, setThoughts] = useState('');
const [modalVisible, setModalVisible] = useState(false);
const [editingTask, setEditingTask] = useState(null);
const [newTask, setNewTask] = useState({
title: '',
estimatedTime: '',
priority: 'Medium',
category: 'Personal'
});
const [stats, setStats] = useState({
totalTasks: 0,
completedTasks: 0,
totalEstimatedTime: 0,
totalActualTime: 0
});

// Load data on app start
useEffect(() => {
loadData();
}, []);

// Calculate stats whenever tasks change
useEffect(() => {
calculateStats();
}, [tasks]);

const loadData = async () => {
try {
const storedTasks = await AsyncStorage.getItem('tasks');
const storedThoughts = await AsyncStorage.getItem('thoughts');

      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
      if (storedThoughts) {
        setThoughts(storedThoughts);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
};

const saveData = async () => {
try {
await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
await AsyncStorage.setItem('thoughts', thoughts);
} catch (error) {
console.error('Error saving data:', error);
}
};

const calculateStats = () => {
const totalTasks = tasks.length;
const completedTasks = tasks.filter(task => task.completed).length;
const totalEstimatedTime = tasks.reduce((sum, task) => sum + parseInt(task.estimatedTime || 0), 0);
const totalActualTime = tasks.reduce((sum, task) => sum + parseInt(task.actualTime || 0), 0);

    setStats({
      totalTasks,
      completedTasks,
      totalEstimatedTime,
      totalActualTime
    });
};

const addTask = () => {
if (newTask.title.trim()) {
const task = {
id: Date.now().toString(),
...newTask,
completed: false,
actualTime: 0,
createdAt: new Date().toISOString()
};

      setTasks([...tasks, task]);
      setNewTask({ title: '', estimatedTime: '', priority: 'Medium', category: 'Personal' });
      setModalVisible(false);
    }
};

const editTask = (task) => {
setEditingTask(task);
setNewTask({
title: task.title,
estimatedTime: task.estimatedTime,
priority: task.priority,
category: task.category
});
setModalVisible(true);
};

const updateTask = () => {
if (editingTask && newTask.title.trim()) {
setTasks(tasks.map(task =>
task.id === editingTask.id
? { ...task, ...newTask }
: task
));
setEditingTask(null);
setNewTask({ title: '', estimatedTime: '', priority: 'Medium', category: 'Personal' });
setModalVisible(false);
}
};

const deleteTask = (taskId) => {
Alert.alert(
'Delete Task',
'Are you sure you want to delete this task?',
[
{ text: 'Cancel', style: 'cancel' },
{ text: 'Delete', style: 'destructive', onPress: () => {
setTasks(tasks.filter(task => task.id !== taskId));
}}
]
);
};

const toggleTask = (taskId) => {
setTasks(tasks.map(task =>
task.id === taskId
? { ...task, completed: !task.completed }
: task
));
};

const generateAIInsights = () => {
const completionRate = stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks * 100).toFixed(1) : 0;
const timeAccuracy = stats.totalEstimatedTime > 0 ?
(100 - Math.abs(stats.totalEstimatedTime - stats.totalActualTime) / stats.totalEstimatedTime * 100).toFixed(1) : 0;

    return {
      completionRate,
      timeAccuracy,
      insight: completionRate > 70 ?
        "Great job! You're consistently completing your tasks." :
        "Consider breaking down larger tasks into smaller, manageable chunks."
    };
};

const aiInsights = generateAIInsights();

// Save data when app goes to background
useEffect(() => {
saveData();
}, [tasks, thoughts]);

if (showSplash) {
return <SplashScreen onFinish={() => setShowSplash(false)} />;
}

return (
<SafeAreaView style={styles.container}>
<StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Day2Do</Text>
        <Text style={styles.headerSubtitle}>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Thoughts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Morning Thoughts & Goals</Text>
          <TextInput
            style={styles.thoughtsInput}
            placeholder="Dump your thoughts, goals, and priorities for today..."
            value={thoughts}
            onChangeText={setThoughts}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* AI Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Insights</Text>
          <View style={styles.insightCard}>
            <Text style={styles.insightText}>
              Completion Rate: {aiInsights.completionRate}%
            </Text>
            <Text style={styles.insightText}>
              Time Accuracy: {aiInsights.timeAccuracy}%
            </Text>
            <Text style={styles.insightAdvice}>{aiInsights.insight}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Progress</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.completedTasks}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalTasks}</Text>
              <Text style={styles.statLabel}>Total Tasks</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalEstimatedTime}</Text>
              <Text style={styles.statLabel}>Est. Minutes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalActualTime}</Text>
              <Text style={styles.statLabel}>Actual Minutes</Text>
            </View>
          </View>
        </View>

        {/* Tasks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Tasks</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.addButtonText}>+ Add Task</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TaskItem
                task={item}
                onToggle={toggleTask}
                onEdit={editTask}
                onDelete={deleteTask}
              />
            )}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </ScrollView>

      {/* Add/Edit Task Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingTask ? 'Edit Task' : 'Add New Task'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Task title"
              value={newTask.title}
              onChangeText={(text) => setNewTask({...newTask, title: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Estimated time (minutes)"
              value={newTask.estimatedTime}
              onChangeText={(text) => setNewTask({...newTask, estimatedTime: text})}
              keyboardType="numeric"
            />

            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Priority:</Text>
              <View style={styles.priorityButtons}>
                {['Low', 'Medium', 'High'].map(priority => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityButton,
                      newTask.priority === priority && styles.priorityButtonSelected
                    ]}
                    onPress={() => setNewTask({...newTask, priority})}
                  >
                    <Text style={[
                      styles.priorityButtonText,
                      newTask.priority === priority && styles.priorityButtonTextSelected
                    ]}>
                      {priority}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setModalVisible(false);
                  setEditingTask(null);
                  setNewTask({ title: '', estimatedTime: '', priority: 'Medium', category: 'Personal' });
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={editingTask ? updateTask : addTask}
              >
                <Text style={styles.saveButtonText}>
                  {editingTask ? 'Update' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
);
};

const styles = StyleSheet.create({
// Splash Screen Styles
splashContainer: {
flex: 1,
backgroundColor: '#6366f1',
justifyContent: 'center',
alignItems: 'center',
},
splashContent: {
alignItems: 'center',
},
appTitle: {
fontSize: 48,
fontWeight: 'bold',
color: '#ffffff',
marginBottom: 8,
},
appSubtitle: {
fontSize: 18,
color: '#e0e7ff',
marginBottom: 4,
},
appDescription: {
fontSize: 14,
color: '#c7d2fe',
textAlign: 'center',
},

// Main App Styles
container: {
flex: 1,
backgroundColor: '#f8fafc',
},
header: {
backgroundColor: '#ffffff',
paddingHorizontal: 20,
paddingVertical: 16,
borderBottomWidth: 1,
borderBottomColor: '#e2e8f0',
},
headerTitle: {
fontSize: 24,
fontWeight: 'bold',
color: '#1e293b',
},
headerSubtitle: {
fontSize: 14,
color: '#64748b',
marginTop: 4,
},
content: {
flex: 1,
padding: 16,
},
section: {
marginBottom: 24,
},
sectionHeader: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
marginBottom: 12,
},
sectionTitle: {
fontSize: 18,
fontWeight: '600',
color: '#1e293b',
marginBottom: 12,
},
thoughtsInput: {
backgroundColor: '#ffffff',
borderRadius: 8,
padding: 16,
minHeight: 100,
borderWidth: 1,
borderColor: '#e2e8f0',
fontSize: 16,
color: '#1e293b',
},
insightCard: {
backgroundColor: '#ffffff',
borderRadius: 8,
padding: 16,
borderWidth: 1,
borderColor: '#e2e8f0',
},
insightText: {
fontSize: 16,
color: '#1e293b',
marginBottom: 8,
},
insightAdvice: {
fontSize: 14,
color: '#6366f1',
fontStyle: 'italic',
marginTop: 8,
},
statsContainer: {
flexDirection: 'row',
justifyContent: 'space-around',
backgroundColor: '#ffffff',
borderRadius: 8,
padding: 16,
borderWidth: 1,
borderColor: '#e2e8f0',
},
statItem: {
alignItems: 'center',
},
statNumber: {
fontSize: 24,
fontWeight: 'bold',
color: '#6366f1',
},
statLabel: {
fontSize: 12,
color: '#64748b',
marginTop: 4,
},
addButton: {
backgroundColor: '#6366f1',
paddingHorizontal: 16,
paddingVertical: 8,
borderRadius: 20,
},
addButtonText: {
color: '#ffffff',
fontSize: 14,
fontWeight: '600',
},
taskItem: {
flexDirection: 'row',
alignItems: 'center',
backgroundColor: '#ffffff',
borderRadius: 8,
padding: 16,
marginBottom: 8,
borderWidth: 1,
borderColor: '#e2e8f0',
},
checkbox: {
width: 24,
height: 24,
borderRadius: 12,
borderWidth: 2,
borderColor: '#e2e8f0',
justifyContent: 'center',
alignItems: 'center',
marginRight: 12,
},
checkboxCompleted: {
backgroundColor: '#10b981',
borderColor: '#10b981',
},
checkmark: {
color: '#ffffff',
fontSize: 16,
fontWeight: 'bold',
},
taskContent: {
flex: 1,
},
taskTitle: {
fontSize: 16,
fontWeight: '500',
color: '#1e293b',
marginBottom: 4,
},
taskCompleted: {
textDecorationLine: 'line-through',
color: '#64748b',
},
taskTime: {
fontSize: 12,
color: '#64748b',
marginBottom: 2,
},
taskPriority: {
fontSize: 12,
color: '#64748b',
},
taskActions: {
flexDirection: 'row',
},
actionButton: {
backgroundColor: '#f1f5f9',
paddingHorizontal: 12,
paddingVertical: 6,
borderRadius: 4,
marginLeft: 4,
},
deleteButton: {
backgroundColor: '#fee2e2',
paddingHorizontal: 12,
paddingVertical: 6,
borderRadius: 4,
marginLeft: 4,
},
actionText: {
fontSize: 12,
fontWeight: '500',
color: '#1e293b',
},

// Modal Styles
modalContainer: {
flex: 1,
justifyContent: 'center',
alignItems: 'center',
backgroundColor: 'rgba(0, 0, 0, 0.5)',
},
modalContent: {
backgroundColor: '#ffffff',
borderRadius: 16,
padding: 24,
width: width * 0.9,
maxWidth: 400,
},
modalTitle: {
fontSize: 20,
fontWeight: 'bold',
color: '#1e293b',
marginBottom: 20,
textAlign: 'center',
},
input: {
borderWidth: 1,
borderColor: '#e2e8f0',
borderRadius: 8,
padding: 12,
marginBottom: 16,
fontSize: 16,
color: '#1e293b',
},
pickerContainer: {
marginBottom: 20,
},
pickerLabel: {
fontSize: 16,
fontWeight: '500',
color: '#1e293b',
marginBottom: 8,
},
priorityButtons: {
flexDirection: 'row',
justifyContent: 'space-between',
},
priorityButton: {
flex: 1,
backgroundColor: '#f1f5f9',
paddingVertical: 12,
paddingHorizontal: 16,
borderRadius: 8,
marginHorizontal: 4,
alignItems: 'center',
},
priorityButtonSelected: {
backgroundColor: '#6366f1',
},
priorityButtonText: {
fontSize: 14,
fontWeight: '500',
color: '#1e293b',
},
priorityButtonTextSelected: {
color: '#ffffff',
},
modalActions: {
flexDirection: 'row',
justifyContent: 'space-between',
},
cancelButton: {
flex: 1,
backgroundColor: '#f1f5f9',
paddingVertical: 12,
borderRadius: 8,
marginRight: 8,
alignItems: 'center',
},
cancelButtonText: {
fontSize: 16,
fontWeight: '500',
color: '#1e293b',
},
saveButton: {
flex: 1,
backgroundColor: '#6366f1',
paddingVertical: 12,
borderRadius: 8,
marginLeft: 8,
alignItems: 'center',
},
saveButtonText: {
fontSize: 16,
fontWeight: '500',
color: '#ffffff',
},
});

export default Day2DoApp;