import { HomeOutlined } from "@ant-design/icons";
import { Button, Menu } from "antd";
import Sider from "antd/es/layout/Sider";
import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

const items = [
  {
    key: 0,
    icon: <HomeOutlined />,
    label: "Home",
    path: "/"
  }
];
const SideNav = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState("");
  useEffect(() => {
    const storedUserData = localStorage.getItem("user");

    if (storedUserData) {
      const userData = JSON.parse(storedUserData);
      setUser(userData);
    }
  }, []);

  return (
    <>
      <Sider
  collapsible
  collapsed={collapsed}
  onCollapse={(value) => setCollapsed(value)}
  breakpoint="lg"
  className="nav-responsive"
>
  <div className="demo-logo-vertical">
    {user?.email && user.email.split("@")[0]}
  </div>
  <Menu theme="dark" mode="inline" defaultSelectedKeys={["0"]}>
    {items.map((item) => (
      <Menu.Item key={item.key} icon={item.icon}>
        <NavLink to={item.path} className="nav-text">
          {item.label}
        </NavLink>
      </Menu.Item>
    ))}
  </Menu>
  <div className="logout-button">
  <Button danger onClick={() => { localStorage.clear(); window.location.reload(); }}>Logout</Button>

  </div>
</Sider>

    </>
  );
};

export default SideNav;
