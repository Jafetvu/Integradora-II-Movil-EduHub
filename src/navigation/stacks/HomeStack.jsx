import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import Home from "../../modules/home/screens/Home";
import CourseDetails from '../../modules/home/components/CourseDetails';
import PayCourse from '../../modules/home/components/PayCourse';
import CourseItem from '../../modules/home/components/CourseItem';
const Stack = createStackNavigator(); 
export default function HomeStack() {
  return (
    <Stack.Navigator  initialRouteName='Home'>
      <Stack.Screen name="Home" component={Home} options={{title:"Home", headerShown: false}}/>
      <Stack.Screen name="CourseDetails" component={CourseDetails} options={{title:"Detalles del curso", headerShown: false}} />
      <Stack.Screen name="PayCourse" component={PayCourse} options={{title:"Pagar curso", headerShown: false}} />
      <Stack.Screen name="CourseItem" component={CourseItem} options={{title:"Detalles del curso", headerShown: false}} />
    </Stack.Navigator>
  )
}