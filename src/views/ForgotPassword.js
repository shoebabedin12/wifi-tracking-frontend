import { UserOutlined } from "@ant-design/icons";
import { Alert, Button, Form, Input, Space, Typography, message } from "antd";
import { Content } from "antd/es/layout/layout";
import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ForgotPassword = ({ email }) => {
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

  const onFinish = async (values) => {
    await axios
      .post(`${api}/auth/forgot-password`, values)
      .then((response) => {
        console.log(response);
        if (response?.status === 200) {
          messageApi.open({
            type: "success",
            content: response?.data.message
          });
          navigate("/login");
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
          name="dependencies"
          autoComplete="off"
          style={{
            maxWidth: 600
          }}
          initialValues={{
            remember: true
          }}
          layout="vertical"
          onFinish={onFinish}
        >
          <Alert
            message={`Try modify ${email ? email : ""}`}
            type="info"
            showIcon
          />
          <Form.Item
            label="Email"
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
            label="Old Password"
            name="oldpassword"
            rules={[
              {
                required: true
              }
            ]}
          >
            <Input />
          </Form.Item>

          {/* Field */}
          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[
              {
                required: true
              }
            ]}
          >
            <Input />
          </Form.Item>

          {/* Render Props */}
          <Form.Item noStyle dependencies={["confirmPassword"]}>
            {() => (
              <Typography>
                <p>
                  Only Update when <code>confirm Password</code> updated:
                </p>
                <pre>{JSON.stringify(form.getFieldsValue(), null, 2)}</pre>
              </Typography>
            )}
          </Form.Item>
          <Form.Item>
            <Space
              style={{
                gap: "1rem"
              }}
            >
              <Button
                type="primary"
                htmlType="submit"
                className="login-form-button"
                loading={loadings[0]}
                onClick={() => enterLoading(0)}
              >
                Submit
              </Button>
              <Button
                onClick={() => window.history.back()}
                className="login-form-button"
              >
                Back
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Content>
    </>
  );
};

export default ForgotPassword;
