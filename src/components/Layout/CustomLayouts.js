import { Layout, theme } from 'antd';
import { Content, Footer, Header } from 'antd/es/layout/layout';
import React from 'react';
import { Outlet } from 'react-router-dom';
import SideNav from '../Common/sideNav/SideNav';

const CustomLayouts = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  return (
    <>
      <Layout  style={{
        minHeight: '100vh',
      }}>
      <SideNav/>
      <Layout>
      <Header style={{ padding: 0, background: colorBgContainer }}>
          
        </Header>
        <Content
          style={{
            margin: '24px 16px 0',
          }}
        >
          <div
            style={{
              padding: 24,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet/>
          </div>
        </Content>
        <Footer
          style={{
            textAlign: 'center',
          }}
        >
          ©{new Date().getFullYear()} Created by Md Sheob Abedin
        </Footer>
      </Layout>
    </Layout>
    </>
  );
};

export default CustomLayouts;
