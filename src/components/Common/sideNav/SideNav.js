import { HomeOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import Sider from 'antd/es/layout/Sider';
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';


const items = [
    {
      key: 0,
      icon: <HomeOutlined />,
      label: 'Home',
      path: '/',
    },
    {
      key: 1,
      icon: <HomeOutlined />,
      label: 'Profile',
      path: '/profile',
    },
  ];
const SideNav = () => {
    const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} breakpoint="lg">
        <div className="demo-logo-vertical"></div>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={["0"]}>
          {items.map((item) => (
            <Menu.Item key={item.key} icon={item.icon}>
              <NavLink to={item.path} className="nav-text">
                {item.label}
              </NavLink>
            </Menu.Item>
          ))}
        </Menu>
      </Sider>
    </>
  );
};

export default SideNav;
