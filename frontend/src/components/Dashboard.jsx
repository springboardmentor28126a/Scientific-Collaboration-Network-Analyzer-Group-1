import { useEffect, useState } from "react";
import {
  Users,
  Building2,
  CalendarDays,
  FileText
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import Navbar from "./Navbar";
import api from "../api/api";


function Dashboard() {


  const [stats, setStats] = useState({
    researchers: 0,
    institutions: 0,
    conferences: 0,
    publications: 0
  });


  const [activities,setActivities] = useState([]);
  const [conferences,setConferences] = useState([]);



  useEffect(()=>{


    const fetchData = async()=>{


      try{


        const [
          researchers,
          institutions,
          conferenceData
        ] = await Promise.all([

          api.get("/researchers"),
          api.get("/institutions"),
          api.get("/conferences")

        ]);



        setStats({

          researchers: researchers.data.length,
          institutions: institutions.data.length,
          conferences: conferenceData.data.length,
          publications:0

        });



        setConferences(
          conferenceData.data.slice(0,3)
        );



        setActivities([

          ...institutions.data.slice(-2).map(item=>(
            `Institution added: ${item.name}`
          )),

          ...conferenceData.data.slice(-2).map(item=>(
            `Conference created: ${item.name}`
          ))

        ]);



      }
      catch(error){

        console.log(error);

      }


    };


    fetchData();


  },[]);





  const cards=[

    {
      title:"Researchers",
      value:stats.researchers,
      icon:<Users/>
    },

    {
      title:"Institutions",
      value:stats.institutions,
      icon:<Building2/>
    },

    {
      title:"Conferences",
      value:stats.conferences,
      icon:<CalendarDays/>
    },

    {
      title:"Publications",
      value:stats.publications,
      icon:<FileText/>
    }

  ];




  const chartData=[

    {
      name:"Researchers",
      count:stats.researchers
    },

    {
      name:"Institutions",
      count:stats.institutions
    },

    {
      name:"Conferences",
      count:stats.conferences
    },

    {
      name:"Publications",
      count:stats.publications
    }

  ];




return(

<div className="app-layout">


<Navbar/>


<main className="dashboard-content">


<h1>
Scientific Collaboration And Network Analyzer
</h1>


<p className="subtitle">
Overview of scientific collaboration activities and research network growth.
</p>




<div className="dashboard-cards">


{
cards.map((card,index)=>(

<div className="dashboard-card" key={index}>

<div className="icon">
{card.icon}
</div>


<h3>
{card.title}
</h3>


<h2>
{card.value}
</h2>


</div>


))
}


</div>






<div className="dashboard-box">


<h2>
Quick Overview
</h2>


<div className="overview-grid">


<p>
Total Researchers: {stats.researchers}
</p>


<p>
Connected Institutions: {stats.institutions}
</p>


<p>
Tracked Conferences: {stats.conferences}
</p>


<p>
Research Publications: {stats.publications}
</p>


</div>


</div>







<div className="dashboard-box">


<h2>
Research Network Statistics
</h2>



<div style={{width:"100%",height:300}}>


<ResponsiveContainer>


<BarChart data={chartData}>


<XAxis dataKey="name"/>

<YAxis/>

<Tooltip/>


<Bar 
 dataKey="count"
 fill="#36071d"
/>


</BarChart>


</ResponsiveContainer>


</div>


</div>








<div className="dashboard-box">


<h2>
Upcoming Conferences
</h2>


{
conferences.length>0 ?

conferences.map((conf,index)=>(

<p key={index}>
📅 {conf.name}
</p>

))

:

<p>
No conferences available
</p>

}


</div>








<div className="dashboard-box">


<h2>
Recent Activity
</h2>



{
activities.length>0 ?

activities.map((item,index)=>(

<p key={index}>
✓ {item}
</p>

))

:

<p>
No recent activity
</p>

}



</div>





</main>


</div>


);


}


export default Dashboard;