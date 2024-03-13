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
  Select,
  Space,
  Table,
  Typography,
  message
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import React, { useEffect, useRef, useState } from "react";
import Highlighter from "react-highlight-words";
import { Link } from "react-router-dom";

const { Option } = Select;

const EditableCell = ({
  title,
  editing,
  dataIndex,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode =
    inputType === "number" ? (
      <InputNumber />
    ) : dataIndex === "status" ? (
      <Select>
        <Option value="Connect">Connect</Option>
        <Option value="Disconnect">Disconnect</Option>
      </Select>
    ) : (
      <Input />
    );

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[{ required: true, message: `Please Input ${title}!` }]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const EditableCellPaymentStatus = ({
  editing,
  dataIndex, // dataIndex is defined here
  title, // title is defined here
  record,
  inputType,
  children,
  ...restProps
}) => {
  let inputNode;

  if (dataIndex === "paymentDate") {
    inputNode = <DatePicker style={{ width: "100%" }} />;
  } else if (dataIndex === "paymentAmount") {
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

const getCurrentMonthYear = () => {
  const currentDate = new Date();
  return { month: currentDate.getMonth() + 1, year: currentDate.getFullYear() };
};

const Home = () => {
  const api = process.env.REACT_APP_API_KEY;
  const [form] = Form.useForm();
  const [modalForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [client, setClient] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [editingKey, setEditingKey] = useState("");
  const isEditing = (record) => record.key === editingKey;
  const [editingKeyModal, setEditingKeyModal] = useState("");
  const isEditing2 = (record) => record.paymentDate === editingKeyModal;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [paidClientsCount, setPaidClientsCount] = useState(0);
  const [allClientsCount, setAllClientsCount] = useState(0);
  const [pendingClientsCount, setPendingClientsCount] = useState(0);
  const [paymentPendingData, setPaymentPendingData] = useState([]);
  const [paymentNeededData, setPaymentNeededData] = useState([]);
  const [selectedUserPaymentDetails, setSelectedUserPaymentDetails] = useState(
    []
  );
  const [lastFetchedMonthYear, setLastFetchedMonthYear] = useState({
    month: 0,
    year: 0
  });

  const onChange = (date, dateString) => {
    console.log(date, dateString);
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

  // main form
  const columns = [
    {
      title: "name",
      dataIndex: "name",
      editable: true,
      ...getColumnSearchProps("name")
    },
    {
      title: "MAC address",
      dataIndex: "macAddress",
      editable: true,
      ...getColumnSearchProps("macAddress")
    },
    {
      title: "Device",
      dataIndex: "device",
      editable: true,
      ...getColumnSearchProps("device")
    },
    {
      title: "Room NO",
      dataIndex: "roomNo",
      editable: true,
      ...getColumnSearchProps("roomNo")
    },
    {
      title: "Connection Status",
      dataIndex: "status",
      key: "status",
      editable: true,
      ...getColumnSearchProps("status")
    },
    {
      title: "Payment Status",
      dataIndex: "paymentStatus",
      key: "Payment Status",
      editable: false,
      ...getColumnSearchProps("Payment Status")
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
      }),
      render: (text, record) => {
        const dataLabel = `${col.title}`; // Custom label combining column title and record key
        return {
          children: <span data-label={dataLabel}>{text}</span>
        };
      }
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
  // main form

  const showModal = (record) => {
    setSelectedUser(record);
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);

    form.resetFields();
  };
  const handleCancel = () => {
    setIsModalOpen(false);

    form.resetFields();
  };

  const onFinishPayment = async (values) => {
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

  // payment add form
  const range = (start, end) => {
    const result = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  };
  const disabledDate = (current) => {
    // Disable dates in the future
    if (current && current > dayjs().endOf("day")) {
      return true;
    }
    // Disable dates in the past
    if (current && current < dayjs().subtract(12, "month").endOf("month")) {
      return true;
    }
    return false;
  };

  const edit2 = (record) => {
    form.setFieldsValue({
      paymentDate: record.paymentDate,
      paymentMonth: record.paymentMonth,
      paymentAmount: record.paymentAmount,
      paymentStatus: record.paymentStatus
    });
    setEditingKeyModal(record.paymentDate);
  };

  const singleDelete2 = async (record) => {
    try {
      console.log(record);
      const deleteClientId = record._id; // Assuming the key represents the client ID
      console.log(deleteClientId);

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

      // If the deletion is successful, update the client state
      const updatedClient = client.filter(
        (item) => item.key !== record.paymentDate
      );
      setClient(updatedClient);
    } catch (error) {
      console.error("Error deleting client:", error);
      // Handle errors if necessary
    }
  };

  const cancel2 = () => {
    setEditingKeyModal("");
  };

  const save2 = async (record, paymentHistoryId) => {
    try {
      const row = await form.validateFields();

      // Update only the payment status for the selected payment detail
      const updatedPaymentDetail = {
        ...record,
        paymentStatus: row.paymentStatus
      };

      // Send a POST request to update the payment detail with its ID
      const response = await axios.post(
        `${api}/user/update-single-client-details`,
        {
          key: paymentHistoryId,
          paymentHistoryId: updatedPaymentDetail._id,
          updatedPaymentDetail: updatedPaymentDetail
        }
      );

      if (response.status === 200) {
        setEditingKey("");
        message.success("Client data updated successfully");
      } else {
        message.error("Failed to update client data");
      }

      // Reset editing key modal
      setEditingKeyModal("");
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  const columns2 = [
    {
      title: "paymentDate",
      dataIndex: "paymentDate",
      ellipsis: true
    },
    {
      title: "paymentAmount",
      dataIndex: "paymentAmount",
      ellipsis: true
    },
    {
      title: "paymentMonth",
      dataIndex: "paymentMonth",
      ellipsis: true
    },
    {
      title: "paymentStatus",
      dataIndex: "paymentStatus",
      editable: true,
      ellipsis: true,
      ...getColumnSearchProps("paymentStatus"),
      render: (text, record, index) => {
        const isEditingPaymentStatus =
          isEditing2(record) && record.dataIndex === "paymentStatus"; // use record.dataIndex
        return isEditingPaymentStatus ? (
          <EditableCellPaymentStatus
            editing={isEditingPaymentStatus}
            dataIndex={record.dataIndex} // use record.dataIndex
            title={record.title} // use record.title
            inputType="select"
            record={record}
            index={index}
          />
        ) : (
          text
        );
      }
    },
    {
      title: "operation",
      dataIndex: "operation",
      ellipsis: true,
      render: (_, record) => {
        const editable = isEditing2(record);
        return editable ? (
          <span>
            <Typography.Link
              onClick={() => save2(record, selectedUser.key)}
              style={{ marginRight: 8 }}
            >
              Save
            </Typography.Link>
            <Popconfirm title="Sure to cancel?" onConfirm={cancel2}>
              <Link>Cancel</Link>
            </Popconfirm>
          </span>
        ) : (
          <Space size="middle">
            <Typography.Link
              disabled={editingKeyModal !== ""}
              onClick={() => edit2(record)}
            >
              Edit
            </Typography.Link>
            <Typography.Link
              disabled={editingKeyModal !== ""}
              onClick={() => singleDelete2(record)}
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
        inputType: col.dataIndex === "paymentStatus" ? "select" : "text",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing2(record)
      })
    };
  });

  const onFinish2 = async (values, userId) => {
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

      console.log("Received values of form:", values.users);
      console.log("Received values of form:", userId);

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
      // messageApi.open({
      //   type: "success",
      //   content: "Payment details submitted successfully"
      // });
    } catch (error) {
      // Handle errors
      messageApi.open({
        type: "error",
        content: error.response.data.message
      });
      console.log(error);
    }
  };

  // payment add form
  // modal payment table
  const calculatePaymentCounts = (clients) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // Month is zero-based

    // Filter out clients with "deactive" status
    const activeClients = clients.filter(
      (client) => client.status !== "Disconnect"
    );
    setAllClientsCount(activeClients);

    const paidClientsCount = activeClients.filter((client) => {
      // Check if the client's payment status is 'paid'
      return (
        client.paymentStatus === "paid" &&
        client.paymentDetails.some((payment) => {
          const paymentMonths = payment.paymentMonth.map(
            (month) => new Date(month)
          );
          return paymentMonths.some(
            (month) => month.getMonth() === currentMonth
          );
        })
      );
    }).length;

    const pendingClientsCount = activeClients.filter((client) => {
      // Check if the client's payment status is 'pending'
      return (
        client.paymentStatus === "pending" &&
        !client.paymentDetails.some((payment) => {
          const paymentMonths = payment.paymentMonth.map(
            (month) => new Date(month)
          );
          return paymentMonths.some(
            (month) => month.getMonth() === currentMonth
          );
        })
      );
    }).length;

    console.log(paidClientsCount);
    console.log(pendingClientsCount);

    // Update state with the counts
    setPaidClientsCount(paidClientsCount);
    setPendingClientsCount(pendingClientsCount);
  };

  useEffect(() => {
    const fetchPendingPayments = async () => {
      try {
        const response = await axios.get(
          `${api}/user/all-client-payments-status`
        );
        // console.log("Pending payments response:", response.data);

        // Check if response.data is defined and contains pendingPayments
        // console.log("Response data:", response.data);
        if (!response.data || !Array.isArray(response.data.pendingPayments)) {
          // console.error("Invalid response format:", response.data);
          return;
        }

        const currentMonthYear = getCurrentMonthYear();

        // Update last fetched month and year
        setLastFetchedMonthYear(currentMonthYear);
        // console.log("Last fetched month and year updated.");
      } catch (error) {
        console.error("Error fetching or processing pending payments:", error);
      }
    };

    // Check if last fetched month and year differ from current month and year
    if (
      lastFetchedMonthYear.month !== getCurrentMonthYear().month ||
      lastFetchedMonthYear.year !== getCurrentMonthYear().year
    ) {
      fetchPendingPayments();
    }
  }, [lastFetchedMonthYear, api, loading]);

  const processPendingPayments = async (users, currentMonthYear) => {
    try {
      for (const user of users) {
        // console.log("Processing user:", user);
        const paymentResponse = await axios.post(
          `${api}/user/client-payment-details`,
          {
            clientId: user.id,
            month: currentMonthYear.month,
            year: currentMonthYear.year
          }
        );

        // console.log("Payment details response:", paymentResponse.data);

        if (paymentResponse.data.paymentDetails.length === 0) {
          // console.log("Adding payment details for user:", user);
          const paymentDate = new Date();
          const paymentAmount = 100;
          let paymentStatus = user.hasPaid ? "paid" : "pending";

          await axios.post(`${api}/user/add-client-payment-history`, {
            clientId: user.id,
            paymentDate,
            paymentAmount,
            paymentStatus
          });

          console.log("Payment details added successfully.");
        }
      }
    } catch (error) {
      console.error("Error processing pending payments:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${api}/user/all-client`);
        // console.log(response.data.data);
        setClient(response.data.data);
        calculatePaymentCounts(response.data.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData(); // Call the async function immediately
  }, [loading, form]);

  const downloadQRCode = () => {
    const canvas = document.getElementById("myqrcode")?.querySelector("canvas");
    if (canvas) {
      const url = canvas.toDataURL();
      const a = document.createElement("a");
      a.download = "QRCode.png";
      a.href = url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <>
      {contextHolder}
      <Row gutter={16} wrap>
        <Col className="gutter-row" span={8} lg={8} md={12} sm={12} xs={24}>
          <Button danger onClick={() => localStorage.clear()}>
            Logout
          </Button>
        </Col>
        <Col className="gutter-row" span={8} lg={8} md={12} sm={12} xs={24}>
          <p>Total Client: {allClientsCount.length}</p>
        </Col>
        <Col className="gutter-row" span={8} lg={8} md={12} sm={12} xs={24}>
          <p>Paid In this month: {paidClientsCount}</p>
        </Col>
        <Col className="gutter-row" span={8} lg={8} md={12} sm={12} xs={24}>
          <p>Pending In this month: {pendingClientsCount}</p>
        </Col>

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
              loading={loading}
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
                      wrap
                      key={key}
                      style={{
                        marginTop: 10
                      }}
                      align="baseline"
                    >
                      <Form.Item
                        style={{ width: "100%" }}
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
                        style={{ width: "100%" }}
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
                        style={{ width: "100%", flex: "1 1 100%" }}
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
                        <Select placeholder="Select a device">
                          {[...Array(10).keys()].map((index) => (
                            <Option key={index + 1} value={index + 1}>
                              {index + 1}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <Form.Item
                        style={{ width: "100%", flex: "1 1 100%" }}
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
                        <Select placeholder="Room No">
                          {["A", "B"].map((prefix) => (
                            <React.Fragment key={prefix}>
                              <Option
                                value={`${prefix}-1`}
                              >{`${prefix}-1`}</Option>
                              {[...Array(prefix === "A" ? 3 : 4).keys()].map(
                                (index) => (
                                  <Option
                                    key={`${prefix}-${index + 2}`}
                                    value={`${prefix}-${index + 2}`}
                                  >
                                    {`${prefix}-${index + 2}`}
                                  </Option>
                                )
                              )}
                            </React.Fragment>
                          ))}
                        </Select>
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    </Space>
                  ))}
                  <Form.Item>
                    <Button
                      style={{
                        marginTop: 10
                      }}
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
              form={modalForm}
              name="dynamic_form_nest_item"
              onFinish={(values) => onFinish2(values, selectedUser.key)}
            >
              <Table
                components={{
                  body: {
                    cell: EditableCellPaymentStatus
                  }
                }}
                bordered
                dataSource={selectedUser?.paymentDetails}
                columns={mergedColumns2}
                pagination={{ onChange: cancel }}
                scroll={{ y: 500 }}
                // Add rowClassName to conditionally apply editing styles
                rowClassName={(record) =>
                  isEditing(record) ? "editing-row" : ""
                }
              />
              <Form.List name="users">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, fieldKey, ...restField }) => (
                      <Space
                        key={key}
                        style={{ marginTop: 10 }}
                        align="baseline"
                        wrap
                      >
                        <Form.Item
                          {...restField}
                          name={[name, "userId"]} // Add a hidden field for user ID
                          fieldKey={[fieldKey, "userId"]} // Add a hidden field for user ID
                          hidden // Hide the user ID field
                        >
                          <Input type="hidden" value={selectedUser.key} />
                        </Form.Item>
                        <Form.Item
                          style={{ width: "100%" }}
                          {...restField}
                          name={[name, "paymentDate"]}
                          fieldKey={[fieldKey, "paymentDate"]}
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
                          fieldKey={[fieldKey, "paymentMonth"]}
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
                          fieldKey={[fieldKey, "paymentAmount"]}
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
                          fieldKey={[fieldKey, "paymentStatus"]}
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

export default Home;
