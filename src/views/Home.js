import {
  MinusCircleOutlined,
  PlusOutlined,
  SearchOutlined
} from "@ant-design/icons";
import {
  Button,
  Col,
  DatePicker,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Space,
  Table,
  Typography,
  message
} from "antd";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import Highlighter from "react-highlight-words";

const Home = () => {
  const api = process.env.REACT_APP_API_KEY;
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [client, setClient] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [editingKey, setEditingKey] = useState("");
  const isEditing = (record) => record.key === editingKey;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);


  const onChange = (date, dateString) => {
    console.log(date, dateString);
  };

  const EditableCell = ({
    editing,
    dataIndex,
    title,
    inputType,
    record,
    index,
    children,
    ...restProps
  }) => {
    const inputNode = inputType === "number" ? <InputNumber /> : <Input />;
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            name={dataIndex}
            style={{
              margin: 0
            }}
            rules={[
              {
                required: true,
                message: `Please Input ${title}!`
              }
            ]}
          >
            {inputNode}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  const start = () => {
    setLoading(true);
    setTimeout(() => {
      setSelectedRowKeys([]);
      setLoading(false);
    }, 1000);
  };
  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange
  };
  const hasSelected = selectedRowKeys.length > 0;

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close
    }) => (
      <div
        style={{
          padding: 8
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: "block"
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? "#1677ff" : undefined
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: "#ffc069",
            padding: 0
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      )
  });

  const edit = (record) => {
    form.setFieldsValue({
      name: record.name,
      macAddress: record.macAddress,
      device: record.device,
      roomNo: record.roomNo, // corrected key name
      status: record.status
    });
    setEditingKey(record.key);
  };

  const singleDelete = async (record) => {
    try {
      console.log(record);
      const deleteClientId = record.key; // Assuming the key represents the client ID
      console.log(deleteClientId);

      // Make the DELETE request with the client ID in the request body
      await axios
        .delete(`${api}/user/delete-client`, { data: { id: deleteClientId } })
        .then((res) => {
          messageApi.open({
            type: "warning",
            content: res?.data.message
          });
        })
        .catch((err) => {
          console.log(err);
        });

      // If the deletion is successful, update the client state
      const updatedClient = client.filter((item) => item.key !== record.key);
      setClient(updatedClient);
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
      const index = client.findIndex((item) => key === item.key);

      if (index > -1) {
        const updatedClient = {
          ...client[index],
          ...row,
          key
        };

        const response = await axios.put(
          `${api}/user/update-client`,
          updatedClient
        );

        if (response.status === 200) {
          // If the update was successful, update the client state with the updated data
          const newData = [...client];
          newData[index] = updatedClient;
          setClient(newData);
          setEditingKey("");

          message.success("Client data updated successfully");
        } else {
          // Handle error if the update was not successful
          message.error("Failed to update client data");
        }
      } else {
        // Handle case if the item to update is not found
        message.error("Item not found");
      }
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  const columns = [
    {
      title: "name",
      dataIndex: "name",
      editable: true,
      ellipsis: true,
      ...getColumnSearchProps("name")
    },
    {
      title: "MAC address",
      dataIndex: "macAddress",
      editable: true,
      ellipsis: true,
      ...getColumnSearchProps("macAddress")
    },
    {
      title: "Device",
      dataIndex: "device",
      editable: true,
      ellipsis: true,
      ...getColumnSearchProps("device")
    },
    {
      title: "Room NO",
      dataIndex: "roomNo",
      editable: true,
      ellipsis: true,
      ...getColumnSearchProps("roomNo")
    },
    {
      title: "Status",
      dataIndex: "status",
      editable: true,
      ellipsis: true,
      ...getColumnSearchProps("status")
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
              style={{
                marginRight: 8
              }}
            >
              Save
            </Typography.Link>
            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
              <a>Cancel</a>
            </Popconfirm>
          </span>
        ) : (
          <Space size="middle">
            <Typography.Link onClick={() => showModal(record)}>
              View
            </Typography.Link>
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
      })
    };
  });

  const columns2 = [
    {
      title: "month",
      dataIndex: "month",
      ...getColumnSearchProps("month")
    },
    {
      title: "Payment Date",
      dataIndex: "paymentDate",
      ...getColumnSearchProps("paymentDate")
    },
    {
      title: "Payment Amount",
      dataIndex: "paymentAmount",
      ...getColumnSearchProps("paymentAmount")
    },
    {
      title: "Due",
      dataIndex: "due",
      ...getColumnSearchProps("due")
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
              style={{
                marginRight: 8
              }}
            >
              Save
            </Typography.Link>
            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
              <a>Cancel</a>
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

  const mergedColumns2 = columns2.map((col) => {
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
      })
    };
  });

  const onFinish = async (values) => {
    console.log("Received values of form:", values);
    await axios
      .post(`${api}/user/add-client`, values)
      .then((response) => {
        console.log(response);
        if (response?.status === 200) {
          messageApi.open({
            type: "success",
            content: response?.data.message
          });
          form.resetFields();
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${api}/user/all-client`);
        // console.log(response.data.data);
        setClient(response.data.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData(); // Call the async function immediately
  }, [loading, form]);

  const showModal = (record) => {
    setSelectedUser(record);
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const onFinish2 = async (values) => {
    console.log("Received values of form:", values);
    await axios
      .post(`${api}/user/add-client-payment-history`, values)
      .then((response) => {
        console.log(response);
        if (response?.status === 200) {
          messageApi.open({
            type: "success",
            content: response?.data.message
          });
          form.resetFields();
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
      <Modal
        visible={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        width={"100%"}
      >
        <Form name="dynamic_form_nest_item" onFinish={onFinish2} form={form}>
          {selectedUser && (
            <>
              <Descriptions title="User Info">
                {Object.entries(selectedUser).map(([key, value]) => (
                  <Descriptions.Item key={key} label={key}>
                    {value}
                  </Descriptions.Item>
                ))}
              </Descriptions>
              <Button
                type="primary"
                onClick={start}
                loading={loading}
                style={{ marginBottom: "1rem" }}
              >
                Reload
              </Button>
              <Table
                dataSource={[selectedUser]}
                columns={mergedColumns2}
                pagination={{ onChange: cancel }}
                scroll={{ y: 500 }}
              />
            </>
          )}
          <Form.List name="paymentDetails">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space
                    key={key}
                    style={{ display: "flex", marginBottom: 8 }}
                    align="baseline"
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "paymentDate"]}
                      fieldKey={[name, "paymentDate"]}
                      rules={[
                        { required: true, message: "Missing payment Date" }
                      ]}
                    >
                      <DatePicker onChange={onChange} needConfirm />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "paymentAmount"]}
                      fieldKey={[name, "paymentAmount"]}
                      rules={[
                        { required: true, message: "Missing payment Amount" }
                      ]}
                    >
                      <InputNumber placeholder="Payment Amount" />
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
                    Add Payment Detail
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
      </Modal>

      <Row>
        <Col span={24}>
          <Form name="dynamic_form_nest_item" onFinish={onFinish} form={form}>
            <div
              style={{
                marginBottom: 16
              }}
            >
              <Button
                type="primary"
                onClick={start}
                // disabled={!hasSelected}
                loading={loading}
              >
                Reload
              </Button>
              <span
                style={{
                  marginLeft: 8
                }}
              >
                {hasSelected ? `Selected ${selectedRowKeys.length} items` : ""}
              </span>
            </div>
            <Table
              components={{
                body: {
                  cell: EditableCell
                }
              }}
              bordered
              dataSource={client}
              columns={mergedColumns}
              // rowSelection={rowSelection}
              rowClassName="editable-row"
              pagination={{
                onChange: cancel
              }}
              scroll={{
                y: 500
              }}
            />
            <Form.List name="users">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space
                      key={key}
                      style={{
                        display: "flex",
                        marginBottom: 8
                      }}
                      align="baseline"
                    >
                      <Form.Item
                        {...restField}
                        name={[name, "name"]}
                        fieldKey={[name, "name"]}
                        rules={[
                          {
                            required: true,
                            message: "Missing name"
                          }
                        ]}
                      >
                        <Input placeholder="Name" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "macAddress"]}
                        fieldKey={[name, "macAddress"]}
                        rules={[
                          {
                            required: true,
                            message: "Missing last MAC Address"
                          }
                        ]}
                      >
                        <Input placeholder="MAC Address" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "device"]}
                        fieldKey={[name, "device"]}
                        rules={[
                          {
                            required: true,
                            message: "Missing device"
                          }
                        ]}
                      >
                        <InputNumber placeholder="device " />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "roomNo"]}
                        fieldKey={[name, "roomNo"]}
                        rules={[
                          {
                            required: true,
                            message: "Missing roomNo"
                          }
                        ]}
                      >
                        <Input placeholder="Room No" />
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
        </Col>
      </Row>
    </>
  );
};

export default Home;
