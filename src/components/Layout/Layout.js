import { theme } from "antd";
import { Content, Footer } from "antd/es/layout/layout";
import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../Header/Header";

const Layout = () => {
  const {
    token: { colorBgContainer, borderRadiusLG }
  } = theme.useToken();
  return (
    <>
      <Layout hasSider>
        <Header />
        <Layout
          style={{
            marginLeft: 200
          }}
        >
          <Header
            style={{
              padding: 0,
              background: colorBgContainer
            }}
          />
          <Content
            style={{
              margin: "24px 16px 0",
              overflow: "initial"
            }}
          >
            <Outlet />
          </Content>
          <Footer
            style={{
              textAlign: "center"
            }}
          >
            Ant Design ©{new Date().getFullYear()} Created by Ant UED
          </Footer>
        </Layout>
      </Layout>
    </>
  );
};

export default Layout;
