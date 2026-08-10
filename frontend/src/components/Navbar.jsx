import { Link } from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarDays,
  BookOpen,
  UserCheck,
  Settings
} from "lucide-react";


function Navbar() {

  return (

    <aside className="sidebar">

      <h2 className="logo">
        SciNexus
      </h2>


      <div className="sidebar-links">


        <Link to="/dashboard">
          <LayoutDashboard size={20} />
          Dashboard
        </Link>


        <Link to="/researchers">
          <Users size={20} />
          Researchers
        </Link>


        <Link to="/institutions">
          <Building2 size={20} />
          Institutions
        </Link>


        <Link to="/conference">
          <CalendarDays size={20} />
          Conferences
        </Link>


        <Link to="/citation">
          <BookOpen size={20} />
          Citation 
        </Link>


        <Link to="/reviewers">
          <UserCheck size={20} />
          Reviewers
        </Link>


        <Link to="/admin">
          <Settings size={20} />
          Admin
        </Link>


      </div>


    </aside>

  );

}


export default Navbar;