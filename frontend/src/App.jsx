import Quiz from './components/quiz/ClassTests'
import Layout from './components/MyLayout'
import {createBrowserRouter,RouterProvider } from 'react-router-dom';
import ClassRoom from './components/classroom/ClassRoomLayout';
import DashBoard from'./components/MyDashboard';
import PeopleSection from './components/classroom/People';
import Stream from './components/Stream';
import Signin from './components/auth/Signin';
import AllTests from './components/nav/AllTests';
import Signup from "./components/auth/Signup"
import CreateClass from './components/classroom/CreateOrJoinClass';
import CreateQuiz from './components/quiz/CreateQuiz'
import QuizLayout from './components/quiz/QuizLayout'
import Settings from './components/nav/Settings';
import CreateQuizForm from './components/quiz/CreateQuizForm'
import Tests from './components/quiz/test'
import Results from './components/quiz/Results'
import ForgetPassword from './components/auth/ForgetPassword';
import ResetPassword from './components/auth/ResetPassword';
import useAuthStore from './store/useAuthStore';

function App() {
  const router = createBrowserRouter([
    {path: '/signin', element:<Signin/>},
    {path: '/signup', element:<Signup/>},
    {path:'/forgot-password',element:<ForgetPassword/>},
    {path:'/reset-password/:uid/:token',element:<ResetPassword/>}, 
    {path:'/create-class',element:<CreateClass/>},     //not-yet set, temporarily in layout file
    {path:'/quiz/attempt/:id',element:<Tests/>},
   {path: '/', element:<Layout/>, children: [
    {path:'settings',element:<Settings/>},
    {path:"/",element:<DashBoard/>},
    {path:"quiz/results/:id",element:<Results/>},
    {path:"tests",element:<AllTests/>},
    {path: `/classroom/:id`, element: <ClassRoom/>, children: [
      {path:"quizes",element:<QuizLayout/>,children:[{path:"",element:<Quiz/>},{path:"create-quiz",element:<CreateQuiz/>},]},
       {path:"people",element:<PeopleSection/>},
       {path:"stream",element:<Stream/>}
      ]},
   

    ]},
    
    
  ]);
    
  
  return(
    <>
    <RouterProvider router={router} />
    </>
  )
}

export default App
