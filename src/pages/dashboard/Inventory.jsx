import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

const Inventory = () => {
  const [items, setItems] = useState([]);

  // ✅ Search + Filter states (INSIDE component)
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [form, setForm] = useState({
    itemName: "",
    category: "",
    quantity: "",
    unit: "",
    minStockLevel: "",
  });

  const [editId, setEditId] = useState(null);

  // Fetch items
  const fetchItems = async () => {
    try {
      const res = await axiosClient.get("/inventory");
      setItems(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Handle input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add / Update
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        itemName: form.itemName,
        category: form.category,
        quantity: parseFloat(form.quantity),
        unit: form.unit,
        minStockLevel: parseFloat(form.minStockLevel),
      };

      if (editId) {
        await axiosClient.put(`/inventory/${editId}`, payload);
      } else {
        await axiosClient.post("/inventory", payload);
      }

      setForm({
        itemName: "",
        category: "",
        quantity: "",
        unit: "",
        minStockLevel: "",
      });

      setEditId(null);
      fetchItems();
    } catch (err) {
      alert("Error (Admin only)");
    }
  };

  // Edit
  const handleEdit = (item) => {
    setForm({
      itemName: item.itemName,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      minStockLevel: item.minStockLevel,
    });
    setEditId(item.id);
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;

    await axiosClient.delete(`/inventory/${id}`);
    fetchItems();
  };

  // ✅ FILTER LOGIC
  const filteredItems = items.filter((i) => {
    const matchName = i.itemName.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter
      ? i.category === categoryFilter
      : true;

    return matchName && matchCategory;
  });

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Inventory Management</h2>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-xl p-4 mb-6 grid grid-cols-2 gap-4"
      >
        <input
          className="border p-2 rounded"
          name="itemName"
          placeholder="Item Name"
          value={form.itemName}
          onChange={handleChange}
        />
        <input
          className="border p-2 rounded"
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
        />
        <input
          className="border p-2 rounded"
          name="quantity"
          placeholder="Quantity"
          value={form.quantity}
          onChange={handleChange}
        />
        <input
          className="border p-2 rounded"
          name="unit"
          placeholder="Unit (kg/ltr)"
          value={form.unit}
          onChange={handleChange}
        />
        <input
          className="border p-2 rounded"
          name="minStockLevel"
          placeholder="Min Stock"
          value={form.minStockLevel}
          onChange={handleChange}
        />

        <button
          type="submit"
          className="col-span-2 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          {editId ? "Update Item" : "Add Item"}
        </button>
      </form>

      {/* 🔍 SEARCH + FILTER */}
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by item name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-1/2"
        />

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border p-2 rounded w-1/2"
        >
          <option value="">All Categories</option>
          {[...new Set(items.map((i) => i.category))].map((cat, index) => (
            <option key={index} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* ⚠ LOW STOCK ALERT */}
      {filteredItems.filter((i) => i.quantity <= i.minStockLevel).length > 0 && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4 font-semibold">
          ⚠{" "}
          {
            filteredItems.filter(
              (i) => i.quantity <= i.minStockLevel
            ).length
          }{" "}
          item(s) are low in stock!
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white shadow-md rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Qty</th>
              <th className="p-3">Unit</th>
              <th className="p-3">Min</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredItems.map((i) => {
              const isLow = i.quantity <= i.minStockLevel;

              return (
                <tr
                  key={i.id}
                  className={`border-t ${isLow ? "bg-red-50" : ""}`}
                >
                  <td className="p-3">{i.itemName}</td>
                  <td className="p-3">{i.category}</td>
                  <td className="p-3">{i.quantity}</td>
                  <td className="p-3">{i.unit}</td>
                  <td className="p-3">{i.minStockLevel}</td>

                  <td className="p-3">
                    {isLow ? (
                      <span className="text-red-600 font-semibold">
                        ⚠ Low Stock
                      </span>
                    ) : (
                      <span className="text-green-600">OK</span>
                    )}
                  </td>

                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => handleEdit(i)}
                      className="bg-yellow-400 hover:bg-yellow-500 px-3 py-1 rounded text-sm transition"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(i.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}

            {filteredItems.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center p-4 text-gray-500">
                  No inventory items found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;