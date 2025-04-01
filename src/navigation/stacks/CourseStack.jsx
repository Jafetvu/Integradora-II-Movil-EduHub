import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import Courses from '../../modules/home/screens/Courses';
import SessionsCourse from '../../modules/home/components/SessionsCourse';
import StudentCourse from '../../modules/home/components/StudentCourse';
import MediaViewer from '../../modules/home/components/MediaViewer';
const Stack = createStackNavigator(); 
export default function CourseStack() {
  return (
    <Stack.Navigator  initialRouteName='Courses'>
      <Stack.Screen name="Courses" component={Courses} options={{title:"Cursos", headerShown: false}}/>
      <Stack.Screen name="StudentCourse" component={StudentCourse} options={{title:"Cursos del estudiante", headerShown: false}} />
      <Stack.Screen name="SessionsCourse" component={SessionsCourse} options={{title:"Sesiones del curso", headerShown: false}} />
      <Stack.Screen name="MediaViewer" component={MediaViewer} options={{title:"Media Viewer", headerShown: false}} />
    </Stack.Navigator>
  )
}