import { Alert, Button, Form, Input, Typography } from "antd";
import { Content } from "antd/es/layout/layout";
import React from "react";

const ForgotPassword = ({ email }) => {
  const [form] = Form.useForm();
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
          layout="vertical"
        >
          <Alert
            message={`Try modify ${email ? email : ""}`}
            type="info"
            showIcon
          />

          <Form.Item
            label="Password"
            name="password"
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
            label="Confirm Password"
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              {
                required: true
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("The new password that you entered do not match!")
                  );
                }
              })
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
           <Button onClick={()=> window.history.back()} className="login-form-button">Back</Button>
          </Form.Item>
        </Form>
      </Content>
    </>
  );
};

export default ForgotPassword;
