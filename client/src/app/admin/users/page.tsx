'use client';

import apiClient from '@/lib/apiClient';
import { AdminUserView, Role } from '@/lib/type';
import { UpdateUserFormData, updateUserSchema } from '@/lib/validators/user';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Badge,
  Button,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Select,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  TextInput,
  ToggleSwitch,
} from 'flowbite-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  HiExclamationCircle,
  HiOutlineExclamationCircle,
  HiOutlinePencilAlt,
  HiOutlineTrash
} from 'react-icons/hi';

export default function AdminUsersPage() {
  // State for users list, loading status, errors, and action status
  const [users, setUsers] = useState<AdminUserView[]>([]);
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null); // Track which user row is deleting
  const [showConfirmModal, setShowConfirmModal] = useState(false); // Delete Modal visibility
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null); // User info for delete modal
  const [showEditModal, setShowEditModal] = useState(false); // Edit Modal visibility
  const [userToEdit, setUserToEdit] = useState<AdminUserView | null>(null); // User data for edit modal
  const [isSavingEdit, setIsSavingEdit] = useState(false); // Loading state for edit form submission

  // --- Form Hook Setup for Edit Modal ---
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEditForm,
    control: controlEdit, // Needed for Controller component
    formState: { errors: editErrors, isDirty: isEditFormDirty },
  } = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
  });

  // --- Effect to pre-fill form when modal opens ---
  useEffect(() => {
    if (userToEdit) {
      // Reset form with user data when userToEdit changes
      resetEditForm({
        name: userToEdit.name,
        role: userToEdit.role,
        isActive: userToEdit.isActive ?? true, 
      });
    } else {
        // Reset form to defaults when modal closes
         resetEditForm({ name: '', role: undefined, isActive: undefined });
    }
  }, [userToEdit, resetEditForm]);


  // --- Fetch Users ---
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.get<AdminUserView[]>('/users');
        const usersWithStatus = response.data.map(u => ({ ...u, isActive: u.isActive ?? true }));
        setUsers(usersWithStatus);
      } catch (err: any) {
        console.error('Failed to fetch users:', err);
        setError('Failed to load users. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []); 

  // --- Helper Functions ---
  const getRoleColor = (role: Role) => {
    switch (role) {
      case Role.PLATFORM_ADMIN: return 'failure';
      case Role.SURVEY_MANAGER: return 'info';
      case Role.PARTICIPANT: return 'yellow';
      default: return 'gray';
    }
  };

  // --- Delete Logic ---
  const handleDeleteUserClick = (userId: string, userName: string) => {
    setUserToDelete({ id: userId, name: userName });
    setShowConfirmModal(true);
  };

  const confirmDeletion = async () => {
    if (!userToDelete) return;
    setShowConfirmModal(false);
    setDeletingUserId(userToDelete.id);
    setError(null); // Clear general errors before attempting delete
    try {
      await apiClient.delete(`/users/${userToDelete.id}`);
      setUsers(currentUsers => currentUsers.filter(u => u.userId !== userToDelete.id));
    } catch (err: any) {
      console.error(`Failed to delete user ${userToDelete.id}:`, err);
      setError(`Failed to delete user ${userToDelete.name}. Please try again.`);
    } finally {
      setDeletingUserId(null);
      setUserToDelete(null);
    }
  };

  // --- Edit Logic ---
  const handleEditUserClick = (user: AdminUserView) => {
    setError(null); // Clear any previous errors
    setUserToEdit(user);
    setShowEditModal(true);
  };

   const onEditSubmit = async (data: UpdateUserFormData) => {
      if (!userToEdit) return;
      setIsSavingEdit(true);
      setError(null);

      try {
          const response = await apiClient.patch<AdminUserView>(`/users/${userToEdit.userId}`, data); // Send validated data
          const updatedUser = response.data;

          // Update the user in the local state array
          setUsers(currentUsers =>
              currentUsers.map(u => (u.userId === updatedUser.userId ? { ...u, ...updatedUser } : u)) // Merge updates
          );

          setShowEditModal(false);
          setUserToEdit(null);

      } catch (err: any) {
          console.error(`Failed to update user ${userToEdit.userId}:`, err);
          setError(`Update failed: ${err.response?.data?.message || err.message}`); 
      } finally {
          setIsSavingEdit(false);
      }
   };

  // --- Render Logic ---

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Spinner size="xl" /></div>;
  }

  // Initial load error
  if (error && users.length === 0) {
    return (
      <div className="p-4">
        <Alert color="failure" icon={HiExclamationCircle}><span><span className="font-medium">Error!</span> {error}</span></Alert>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
        Manage Users
      </h1>
      {/* Display general errors */}
      {error && !isLoading && (
           <Alert color="failure" icon={HiExclamationCircle} onDismiss={() => setError(null)} className="mb-4">
              <span><span className="font-medium">Error!</span> {error}</span>
           </Alert>
      )}
      {/* Add Button Placeholder */}
      <div className="mb-4"><Button size="sm">Add New User</Button></div>

      <div className="overflow-x-auto">
        <Table hoverable={true}>
          <TableHead>
            <TableRow>
            <TableHeadCell>Name</TableHeadCell>
            <TableHeadCell>FirstName</TableHeadCell>
            <TableHeadCell>LastName</TableHeadCell>
            <TableHeadCell>Email</TableHeadCell>
            <TableHeadCell>Role</TableHeadCell>
            <TableHeadCell>Status</TableHeadCell> 
            <TableHeadCell>
              <span className="sr-only">Actions</span>
            </TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody className="divide-y">
            {users.length === 0 && !isLoading && (
               <TableRow><TableCell colSpan={7} className="text-center text-gray-500 dark:text-gray-400 py-4">No users found.</TableCell></TableRow>
            )}
            {users.map((user) => (
              <TableRow key={user.userId} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">{user.name}</TableCell>
                <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">{user.firstName}</TableCell>
                <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">{user.lastName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell><Badge color={getRoleColor(user.role)} size="sm">{user.role}</Badge></TableCell>
                <TableCell> {/* Added Status Cell */}
                    <Badge color={user.isActive ? 'success' : 'gray'} size="sm">
                       {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                </TableCell>
                <TableCell>
                   {/* Use div or ButtonGroup */}
                   <div className="flex flex-wrap gap-2">
                     <Button color="gray" size="xs" onClick={() => handleEditUserClick(user)} title="Edit User" disabled={!!deletingUserId}>
                         <HiOutlinePencilAlt className="h-4 w-4" />
                     </Button>
                     <Button color="gray" size="xs" onClick={() => handleDeleteUserClick(user.userId, user.name)} disabled={deletingUserId === user.userId} title="Delete User">
                       {deletingUserId === user.userId ? <Spinner size="sm" /> : <HiOutlineTrash className="h-4 w-4 text-red-600 group-hover:text-red-800 dark:text-red-500 dark:group-hover:text-red-600" />}
                     </Button>
                   </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* Pagination Placeholder */}

      {/* --- Delete Confirmation Modal --- */}
      <Modal show={showConfirmModal} size="md" popup onClose={() => setShowConfirmModal(false)}>
        <ModalHeader />
        <ModalBody>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-red-600" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Are you sure you want to delete the user "{userToDelete?.name}"?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="red" onClick={confirmDeletion}>{"Yes, I'm sure"}</Button>
              <Button color="gray" onClick={() => setShowConfirmModal(false)}>No, cancel</Button>
            </div>
          </div>
        </ModalBody>
      </Modal>

      {/* --- Edit User Modal --- */}
      <Modal show={showEditModal} size="lg" onClose={() => { setShowEditModal(false); setUserToEdit(null); }}>
        {/* Form handles submission */}
        <form onSubmit={handleSubmitEdit(onEditSubmit)}>
          <ModalHeader>Edit User: {userToEdit?.name ?? '...'}</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              {/* Name Input */}
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="edit-name" >Name</Label>
                  </div>
                <TextInput id="edit-name" placeholder="full name" color={editErrors.name ? 'failure' : 'gray'} {...registerEdit('name')} />
                {editErrors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{editErrors.name.message}</p>}
              </div>
              {/* FirstName Input */}
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="edit-name" >FirstName</Label>
                  </div>
                <TextInput id="edit-firstName" placeholder="first name"  color={editErrors.firstName ? 'failure' : 'gray'} {...registerEdit('firstName')} />
                {editErrors.firstName && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{editErrors.firstName.message}</p>}
              </div>
              {/* lastName Input */}
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="edit-lastName" >LastName</Label>
                  </div>
                <TextInput id="edit-lastName" placeholder="last name"  color={editErrors.lastName ? 'failure' : 'gray'} {...registerEdit('lastName')} />
                {editErrors.lastName && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{editErrors.lastName.message}</p>}
              </div>
              {/* Role Select */}
              <div>
                <div className="mb-2 block"><Label htmlFor="edit-role" >Role</Label></div>
                <Select id="edit-role" required color={editErrors.role ? 'failure' : 'gray'} {...registerEdit('role')}>
                  {Object.values(Role).map((roleValue) => (
                    <option key={roleValue} value={roleValue}>{roleValue}</option>
                  ))}
                </Select>
                {editErrors.role && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{editErrors.role.message}</p>}
              </div>
              {/* IsActive Toggle Switch */}
              <div>
                 {/* Controller needed for custom/non-standard form components */}
                <Controller
                  name="isActive"
                  control={controlEdit}
                  render={({ field: { onChange, value, name, ref } }) => ( // Pass ref if needed by component
                    <ToggleSwitch
                      id={name}
                      name={name}
                      label="Active Status"
                      checked={value ?? true} // Default to true if undefined from data
                      onChange={onChange}
                      ref={ref} // Pass ref if ToggleSwitch forwards it
                      color={editErrors.isActive ? 'failure' : 'info'}
                    />
                  )}
                />
                 {editErrors.isActive && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{editErrors.isActive.message}</p>}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button type="submit" disabled={isSavingEdit || !isEditFormDirty}>
              {isSavingEdit ? <Spinner size="sm" className="mr-2" /> : null}
              Save Changes
            </Button>
            <Button color="gray" onClick={() => { setShowEditModal(false); setUserToEdit(null); }} disabled={isSavingEdit}>
              Cancel
            </Button>
          </ModalFooter>
        </form>
      </Modal>

    </div>
  );
}