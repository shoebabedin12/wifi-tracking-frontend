import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input, Space, message } from "antd";
import { Content } from "antd/es/layout/layout";
import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const api = process.env.REACT_APP_API_KEY;
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loadings, setLoadings] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();

  const enterLoading = (index) => {
    setLoadings((prevLoadings) => {
      const newLoadings = [...prevLoadings];
      newLoadings[index] = true;
      return newLoadings;
    });
    setTimeout(() => {
      setLoadings((prevLoadings) => {
        const newLoadings = [...prevLoadings];
        newLoadings[index] = false;
        return newLoadings;
      });
    }, 6000);
  };

  const onFinish = (values) => {
    axios
      .post(`${api}/auth/login`, values)
      .then((response) => {
        console.log(response);
        if (response.status === 200) {
          localStorage.setItem("user", JSON.stringify(response?.data.user));
          messageApi.open({
            type: "success",
            content: response.data.message
          });
          navigate("/");
        }
      })
      .catch((error) => {
        messageApi.open({
          type: "error",
          content: error.response.data.message
        });
        console.log(error);
      });
  };

  return (
    <>
      {contextHolder}
      <Content
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          margin: "24px 16px 0"
        }}
      >
        <Form
          form={form}
          name="normal_login"
          className="login-form"
          initialValues={{
            remember: true
          }}
          onFinish={onFinish}
        >
          <Form.Item
            name="email"
            rules={[
              {
                required: true,
                message: "Please input your Username!"
              }
            ]}
          >
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="Username"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: "Please input your Password!"
              }
            ]}
          >
            <Input
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="Password"
            />
          </Form.Item>
          <Form.Item>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Remember me</Checkbox>
            </Form.Item>
            <Link className="login-form-forgot" to="/forgot-password">
              Forgot password
            </Link>
          </Form.Item>
          <Form.Item>
            <Space size="middle">
              <Button
                type="primary"
                htmlType="submit"
                className="login-form-button"
                loading={loadings[0]}
                onClick={() => enterLoading(0)}
              >
                Log in
              </Button>
              Or <Link to="/signup">register now!</Link>
            </Space>
          </Form.Item>
        </Form>
      </Content>
    </>
  );
};

export default Login;
