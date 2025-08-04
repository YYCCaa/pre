// src/app/devices/page.tsx (Complete version)
'use client';
  
import React, { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/Layout/ProtectedRoute';
import { apiClient } from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';
import { Cpu, Wifi, WifiOff, AlertTriangle, MapPin, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';

interface Device {
  id: string;
  deviceId: string;
  name: string;
  location: string;
  latitude?: number;
  longitude?: number;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateDeviceFormData {
  deviceId: string;
  name: string;
  location?: string;
  latitude?: number;
  longitude?: number;
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const socket = useSocket();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateDeviceFormData>();

  useEffect(() => {
    fetchDevices();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('device-status', handleDeviceStatus);
      return () => {
        socket.off('device-status', handleDeviceStatus);
      };
    }
  }, [socket]);

  const fetchDevices = async () => {
    try {
      const response = await apiClient.get('/devices');
      setDevices(response.data);
    } catch (error) {
      toast.error('Failed to fetch devices');
      console.error('Devices fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceStatus = (data: { deviceId: string; status: string }) => {
    setDevices(prev => 
      prev.map(device => 
        device.deviceId === data.deviceId 
          ? { ...device, status: data.status }
          : device
      )
    );
    toast.success(`Device ${data.deviceId} status changed to ${data.status}`);
  };

  const onSubmitCreate = async (data: CreateDeviceFormData) => {
    try {
      const response = await apiClient.post('/devices', data);
      setDevices(prev => [response.data, ...prev]);
      setShowCreateModal(false);
      reset();
      toast.success('Device created successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create device');
    }
  };

  const onSubmitEdit = async (data: CreateDeviceFormData) => {
    if (!editingDevice) return;
    
    try {
      const response = await apiClient.patch(`/devices/${editingDevice.id}`, data);
      setDevices(prev => 
        prev.map(device => 
          device.id === editingDevice.id ? response.data : device
        )
      );
      setEditingDevice(null);
      reset();
      toast.success('Device updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update device');
    }
  };

  const handleDelete = async (device: Device) => {
    if (!confirm(`Are you sure you want to delete device "${device.name}"?`)) {
      return;
    }

    try {
      await apiClient.delete(`/devices/${device.id}`);
      setDevices(prev => prev.filter(d => d.id !== device.id));
      toast.success('Device deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete device');
    }
  };

  const handleEdit = (device: Device) => {
    setEditingDevice(device);
    reset({
      deviceId: device.deviceId,
      name: device.name,
      location: device.location,
      latitude: device.latitude,
      longitude: device.longitude,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <Wifi className="h-5 w-5 text-green-500" />;
      case 'offline':
        return <WifiOff className="h-5 w-5 text-red-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Cpu className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800';
      case 'offline':
        return 'bg-red-100 text-red-800';
      case 'error':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const DeviceForm = ({ onSubmit, isEditing = false }: { onSubmit: (data: CreateDeviceFormData) => void; isEditing?: boolean }) => (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="deviceId" className="block text-sm font-medium text-gray-700">
          Device ID
        </label>
        <input
          {...register('deviceId', {
            required: 'Device ID is required',
            minLength: { value: 3, message: 'Device ID must be at least 3 characters' },
          })}
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="jetson-001"
          disabled={isEditing}
        />
        {errors.deviceId && (
          <p className="mt-2 text-sm text-red-600">{errors.deviceId.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Device Name
        </label>
        <input
          {...register('name', {
            required: 'Device name is required',
            minLength: { value: 2, message: 'Device name must be at least 2 characters' },
          })}
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Main Entrance Camera"
        />
        {errors.name && (
          <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
          Location (Optional)
        </label>
        <input
          {...register('location')}
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Building A - Main Entrance"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">
            Latitude (Optional)
          </label>
          <input
            {...register('latitude', {
              min: { value: -90, message: 'Latitude must be between -90 and 90' },
              max: { value: 90, message: 'Latitude must be between -90 and 90' },
            })}
            type="number"
            step="any"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="40.7128"
          />
          {errors.latitude && (
            <p className="mt-2 text-sm text-red-600">{errors.latitude.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">
            Longitude (Optional)
          </label>
          <input
            {...register('longitude', {
              min: { value: -180, message: 'Longitude must be between -180 and 180' },
              max: { value: 180, message: 'Longitude must be between -180 and 180' },
            })}
            type="number"
            step="any"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="-74.0060"
          />
          {errors.longitude && (
            <p className="mt-2 text-sm text-red-600">{errors.longitude.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={() => {
            setShowCreateModal(false);
            setEditingDevice(null);
            reset();
          }}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {isEditing ? 'Update Device' : 'Create Device'}
        </button>
      </div>
    </form>
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Devices</h1>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Device
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : devices.length === 0 ? (
              <div className="bg-white shadow rounded-lg">
                <div className="text-center py-12">
                  <Cpu className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No devices</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by adding your first device.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Device
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {devices.map((device) => (
                  <div key={device.id} className="bg-white rounded-lg shadow hover-lift">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="p-3 bg-blue-100 rounded-lg">
                            <Cpu className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-lg font-medium text-gray-900">
                              {device.name}
                            </h3>
                            <p className="text-sm text-gray-500">{device.deviceId}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleEdit(device)}
                            className="p-1 text-gray-400 hover:text-blue-600"
                            title="Edit device"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(device)}
                            className="p-1 text-gray-400 hover:text-red-600"
                            title="Delete device"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(device.status)}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(device.status)}`}>
                            {device.status}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {device.location && (
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="h-4 w-4 mr-2" />
                            {device.location}
                          </div>
                        )}
                        
                        {device.latitude && device.longitude && (
                          <div className="text-sm text-gray-500">
                            Coordinates: {device.latitude.toFixed(6)}, {device.longitude.toFixed(6)}
                          </div>
                        )}

                        <div className="text-sm text-gray-500">
                          Last updated: {new Date(device.updatedAt).toLocaleString()}
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Active:</span>
                          <span className={device.isActive ? 'text-green-600' : 'text-red-600'}>
                            {device.isActive ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create Device Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Add New Device
                </h3>
                <DeviceForm onSubmit={onSubmitCreate} />
              </div>
            </div>
          </div>
        )}

        {/* Edit Device Modal */}
        {editingDevice && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Edit Device: {editingDevice.name}
                </h3>
                <DeviceForm onSubmit={onSubmitEdit} isEditing={true} />
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}