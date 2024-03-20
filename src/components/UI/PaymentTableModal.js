import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  DatePicker,
  Descriptions,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Typography,
  message
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import React, { useState } from "react";
import { Link } from "react-router-dom";

const { Option } = Select;
const EditableCell = ({
  editing,
  dataIndex,
  title,
  record,
  inputType,
  children,
  ...restProps
}) => {
  let inputNode;

  if (dataIndex === "paymentAmount") {
    inputNode = <Input />;
  } else if (dataIndex === "paymentStatus") {
    inputNode = (
      <Select>
        <Option value="paid">Paid</Option>
        <Option value="pending">Pending</Option>
      </Select>
    );
  } else {
    inputNode = <Input />;
  }

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          initialValue={record[dataIndex]}
          rules={[{ required: true, message: `Please Select ${title}!` }]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const PaymentTableModal = ({
  selectedUser,
  isModalOpen,
  handleOk,
  handleCancel,
  messageApi
}) => {
  const api = process.env.REACT_APP_API_KEY;
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState("");
  const isEditing = (record) => record.key === editingKey;

  const onChange = (date, dateString) => {
    console.log(date, dateString);
  };

  const edit = (record) => {
    console.log("edit clicked data", record);

    form.setFieldsValue({
      paymentDate: record.paymentDate,
      paymentAmount: record.paymentAmount,
      paymentMonth: record.paymentMonth,
      paymentStatus: record.paymentStatus
    });
    setEditingKey(record.key);
  };

  const singleDelete = async (record) => {
    try {
      const deleteClientId = record.key; // Assuming the key represents the client ID

      // Make the DELETE request with the client ID in the request body
      await axios
        .delete(`${api}/user/delete-single-client-details`, {
          data: { id: deleteClientId }
        })
        .then((res) => {
          messageApi.open({
            type: "warning",
            content: res?.data.message
          });
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      console.error("Error deleting client:", error);
      // Handle errors if necessary
    }
  };

  const cancel = () => {
    setEditingKey("");
  };

  const save = async (key) => {
    try {
      const row = await form.validateFields();
      if (key) {
        const updatedClient = {
          ...selectedUser,
          ...row,
          key
        };

        const response = await axios.post(
          `${api}/user/update-single-client-details`,
          {
            id: updatedClient.key,
            paymentDate: updatedClient.paymentDate,
            paymentMonth: updatedClient.paymentMonth,
            paymentAmount: updatedClient.paymentAmount,
            paymentStatus: updatedClient.paymentStatus
          }
        );

        if (response.status === 200) {
          setEditingKey("");
          message.success("Client data updated successfully");
        } else {
          message.error("Failed to update client data");
        }
        setEditingKey("");

        return response;
      }
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  const columns = [
    {
      title: "paymentDate",
      dataIndex: "paymentDate"
    },
    {
      title: "paymentAmount",
      dataIndex: "paymentAmount",
      editable: true
    },
    {
      title: "paymentMonth",
      dataIndex: "paymentMonth",
      editable: true
    },
    {
      title: "paymentStatus",
      dataIndex: "paymentStatus",
      editable: true
    },
    {
      title: "operation",
      dataIndex: "operation",
      ellipsis: true,
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Typography.Link
              onClick={() => save(record.key)}
              style={{ marginRight: 8 }}
            >
              Save
            </Typography.Link>
            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
              <Link>Cancel</Link>
            </Popconfirm>
          </span>
        ) : (
          <Space size="middle">
            <Typography.Link
              disabled={editingKey !== ""}
              onClick={() => edit(record)}
            >
              Edit
            </Typography.Link>
            <Typography.Link
              disabled={editingKey !== ""}
              onClick={() => singleDelete(record)}
            >
              Delete
            </Typography.Link>
          </Space>
        );
      }
    }
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: col.dataIndex && "text",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record)
      }),
      render: (text, record) => {
        const dataLabel = `${col.title}`; // Custom label combining column title and record key
        return {
          children: <span data-label={dataLabel}>{text}</span>
        };
      }
    };
  });

  const onFinish = async (values, userId) => {
    try {
      values.users = values.users.map((user) => {
        const formattedMonths = user.paymentMonth.map((month) =>
          dayjs(month).format("YYYY-MM")
        );
        return {
          ...user,
          paymentDate: dayjs(user.paymentDate).format("YYYY-MM-DD"),
          paymentMonth: formattedMonths
        };
      });

      // Iterate through each user and send the payment details
      for (const user of values.users) {
        // Extract user details
        const { paymentDate, paymentMonth, paymentAmount, paymentStatus } =
          user;

        // Use userId passed from the form
        const clientId = userId;
        // Perform Axios POST request to send payment details
        const paymentResponse = await axios.post(
          `${api}/user/add-client-payment-history`,
          {
            clientId,
            paymentDate,
            paymentMonth,
            paymentAmount,
            paymentStatus
          }
        );

        // Log response
        console.log("Payment details response:", paymentResponse.data);
      }

      // Reset form fields if necessary
      form.resetFields();

      // Display success message if needed
      messageApi.open({
        type: "success",
        content: "Payment details submitted successfully"
      });
    } catch (error) {
      // Handle errors
      messageApi.open({
        type: "error",
        content: error.response.data.message
      });
      console.log(error);
    }
  };

  return (
    <>
      <Modal
        visible={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        width={"80%"}
      >
        {selectedUser && (
          <>
            <Descriptions title="User Info">
              {Object.entries(selectedUser)
                .filter(([key]) => key !== "paymentDetails")
                .map(([key, value]) => (
                  <Descriptions.Item key={key} label={key}>
                    {value}
                  </Descriptions.Item>
                ))}
            </Descriptions>
            <Form
              form={form}
              name="dynamic_form_nest_item"
              onFinish={(values) => onFinish(values, selectedUser.key)}
            >
              <Table
                components={{
                  body: {
                    cell: EditableCell
                  }
                }}
                bordered
                dataSource={selectedUser?.paymentDetails}
                columns={mergedColumns}
                pagination={{
                  onChange: cancel
                }}
                scroll={{
                  y: 500
                }}
                rowClassName="editable-row"
              />
              <Form.List name="users">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Space
                        key={key}
                        style={{ marginTop: 10 }}
                        align="baseline"
                        wrap
                      >
                        <Form.Item
                          {...restField}
                          name={[name, "userId"]} // Add a hidden field for user ID
                          fieldKey={[name, "userId"]} // Add a hidden field for user ID
                          hidden // Hide the user ID field
                        >
                          <Input type="hidden" value={selectedUser.key} />
                        </Form.Item>
                        <Form.Item
                          style={{ width: "100%" }}
                          {...restField}
                          name={[name, "paymentDate"]}
                          fieldKey={[name, "paymentDate"]}
                          rules={[
                            {
                              required: true,
                              message: "Missing paymentDate"
                            }
                          ]}
                        >
                          <DatePicker
                            style={{ width: "100%" }}
                            placeholder="Payment Date"
                          />
                        </Form.Item>

                        <Form.Item
                          style={{ width: "100%" }}
                          {...restField}
                          name={[name, "paymentMonth"]}
                          fieldKey={[name, "paymentMonth"]}
                          rules={[
                            {
                              required: true,
                              message: "Please select a payment month"
                            }
                          ]}
                        >
                          <DatePicker
                            multiple
                            picker="month"
                            onChange={onChange}
                            placeholder="Select payment month"
                          />
                        </Form.Item>

                        <Form.Item
                          style={{ width: "100%" }}
                          {...restField}
                          name={[name, "paymentAmount"]}
                          fieldKey={[name, "paymentAmount"]}
                          rules={[
                            {
                              required: true,
                              message: "Missing last Payment Amount"
                            }
                          ]}
                        >
                          <Input placeholder="Payment Amount" />
                        </Form.Item>

                        <Form.Item
                          style={{ width: "100%", flex: "1 1 100%" }}
                          {...restField}
                          name={[name, "paymentStatus"]}
                          fieldKey={[name, "paymentStatus"]}
                          rules={[
                            {
                              required: true,
                              message: "Please select a payment status"
                            }
                          ]}
                        >
                          <Select placeholder="Select a payment Status">
                            <Select.Option value="paid">Paid</Select.Option>
                            <Select.Option value="pending">
                              Pending
                            </Select.Option>
                          </Select>
                        </Form.Item>

                        <MinusCircleOutlined onClick={() => remove(name)} />
                      </Space>
                    ))}
                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                      >
                        Add field
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>

              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </>
  );
};

export default PaymentTableModal;
