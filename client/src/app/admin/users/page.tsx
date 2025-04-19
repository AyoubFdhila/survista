// client/src/app/admin/users/page.tsx
'use client';

import apiClient from '@/lib/apiClient'; //
import { AdminUserView, Role } from '@/lib/type'; //
import {
  CreateUserInput, // Input type for create form
  UpdateUserFormData,
  updateUserSchema,
} from '@/lib/validators/user'; //
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
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import {
  HiExclamationCircle,
  HiOutlineExclamationCircle,
  HiOutlinePencilAlt,
  HiOutlineTrash,
} from 'react-icons/hi';
import { CreateUserModal } from '@/components/admin/CreateUserModal'; // Import the modal
import { useToast } from '@/hooks/use-toast'; // Import toast hook

export default function AdminUsersPage() {
  // State for users list, loading status, errors, and action status
  const [users, setUsers] = useState<AdminUserView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState<AdminUserView | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const { toast } = useToast(); // Initialize toast hook

  // --- Form Hook Setup for Edit Modal ---
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEditForm,
    control: controlEdit,
    formState: { errors: editErrors, isDirty: isEditFormDirty },
  } = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
  });

  // --- Effect to pre-fill Edit form ---
  useEffect(() => {
    if (userToEdit) {
      resetEditForm({
        name: userToEdit.name,
        firstName: userToEdit.firstName || '', // Handle potential null values
        lastName: userToEdit.lastName || '', // Handle potential null values
        role: userToEdit.role,
        isActive: userToEdit.isActive ?? true,
      });
    } else {
       resetEditForm({ name: '', firstName: '', lastName: '', role: undefined, isActive: true });
    }
  }, [userToEdit, resetEditForm]);

  // --- Fetch Users Function ---
  const fetchUsers = async () => {
    // Only set main loading indicator on initial load
    if (users.length === 0) setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<AdminUserView[]>('/users');
      const usersWithStatus = response.data.map(u => ({ ...u, isActive: u.isActive ?? true }));
      setUsers(usersWithStatus);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users. Please try again later.');
    } finally {
      // Always turn off main loading indicator
      setIsLoading(false);
    }
  };

  // Initial Fetch
  useEffect(() => {
    fetchUsers();
  }, []);

  // --- Helper Function ---
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
    const userName = userToDelete.name; // Store name before clearing state
    const userId = userToDelete.id;
    setShowConfirmModal(false);
    setDeletingUserId(userId);
    setError(null);
    try {
      await apiClient.delete(`/users/${userId}`);
      setUsers(currentUsers => currentUsers.filter(u => u.userId !== userId)); // Update state locally
      toast({ title: 'Success', description: `User "${userName}" deleted.` });
    } catch (err: any) {
      console.error(`Failed to delete user ${userId}:`, err);
      const errorMsg = err.response?.data?.message || 'Failed to delete user.';
      setError(`Failed to delete user "${userName}". ${errorMsg}`);
      toast({ variant: 'destructive', title: 'Error', description: errorMsg });
    } finally {
      setDeletingUserId(null);
      setUserToDelete(null);
    }
  };

  // --- Edit Logic ---
  const handleEditUserClick = (user: AdminUserView) => {
    setError(null);
    setUserToEdit(user);
    setShowEditModal(true);
  };

  const onEditSubmit = async (data: UpdateUserFormData) => {
    if (!userToEdit) return;
    setIsSavingEdit(true);
    setError(null);
    try {
      const response = await apiClient.patch<AdminUserView>(`/users/${userToEdit.userId}`, data);
      const updatedUser = response.data;
      setUsers(currentUsers =>
        currentUsers.map(u => (u.userId === updatedUser.userId ? { ...u, ...updatedUser } : u))
      );
      toast({ title: 'Success', description: `User "${updatedUser.name}" updated.` });
      setShowEditModal(false);
      setUserToEdit(null);
    } catch (err: any) {
      console.error(`Failed to update user ${userToEdit.userId}:`, err);
      const errorMsg = err.response?.data?.message || 'Update failed.';
      setError(`Update failed for "${userToEdit.name}". ${errorMsg}`); // Show error in main Alert
      toast({ variant: 'destructive', title: 'Error updating user', description: errorMsg });
    } finally {
      setIsSavingEdit(false);
    }
  };

  // --- *** STEP 1.6: Create User Logic *** ---
  const onCreateSubmit: SubmitHandler<CreateUserInput> = async (data) => {
    setIsCreatingUser(true);
    setError(null); // Clear previous errors
    try {
      // Call the backend API endpoint created in Step 1.3
      const response = await apiClient.post<AdminUserView>('/users', data);
      const newUser = response.data; // newUser should match AdminUserView

      // Optimistic Update: Add new user to the beginning of the list
      setUsers(currentUsers => [newUser, ...currentUsers]);

      toast({ title: 'Success', description: `User "${newUser.name}" created successfully.` });
      setShowCreateModal(false); // Close the modal on success

    } catch (err: any) {
      console.error('Failed to create user:', err);
      const errorMsg = err.response?.data?.message || 'Failed to create user.';
      // Display error in the main alert for visibility
      setError(errorMsg);
      toast({ variant: 'destructive', title: 'Error Creating User', description: errorMsg });
      // Keep the modal open on error so the user can correct input
    } finally {
      setIsCreatingUser(false); // End loading state
    }
  };

  // --- Render Logic ---
  if (isLoading && users.length === 0) {
    return <div className="flex justify-center items-center h-64"><Spinner size="xl" /></div>;
  }

  if (error && users.length === 0 && !isLoading) { // Show error only if loading finished and no users loaded
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
      {/* Display general/action errors */}
      {error && !isLoading && (
           <Alert color="failure" icon={HiExclamationCircle} onDismiss={() => setError(null)} className="mb-4">
             <span><span className="font-medium">Error!</span> {error}</span>
           </Alert>
       )}
      {/* Add User Button */}
      <div className="mb-4">
        <Button size="sm" onClick={() => setShowCreateModal(true)} disabled={isLoading}>
          Add New User
        </Button>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <Table hoverable={true}>
          <TableHead>
            <TableRow>
              <TableHeadCell>Name</TableHeadCell>
              <TableHeadCell>First Name</TableHeadCell> {/* Added */}
              <TableHeadCell>Last Name</TableHeadCell>  {/* Added */}
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
                <TableCell>{user.firstName ?? '-'}</TableCell> {/* Display '-' if null */}
                <TableCell>{user.lastName ?? '-'}</TableCell>  {/* Display '-' if null */}
                <TableCell>{user.email}</TableCell>
                <TableCell><Badge color={getRoleColor(user.role)} size="sm">{user.role}</Badge></TableCell>
                <TableCell>
                  <Badge color={user.isActive ? 'success' : 'gray'} size="sm">
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
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

      {/* Delete Confirmation Modal */}
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

      {/* Edit User Modal */}
      <Modal show={showEditModal} size="lg" onClose={() => { setShowEditModal(false); setUserToEdit(null); }}>
        <form onSubmit={handleSubmitEdit(onEditSubmit)}>
          <ModalHeader>Edit User: {userToEdit?.name ?? '...'}</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              {/* Name Input */}
              <div>
                <div className="mb-2 block"><Label htmlFor="edit-name">Name *</Label></div>
                <TextInput id="edit-name" placeholder="full name" color={editErrors.name ? 'failure' : 'gray'} {...registerEdit('name')} />
                {editErrors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{editErrors.name.message}</p>}
              </div>
               {/* FirstName Input */}
              <div>
                 <div className="mb-2 block"><Label htmlFor="edit-firstName">First Name</Label></div>
                 <TextInput id="edit-firstName" placeholder="first name" color={editErrors.firstName ? 'failure' : 'gray'} {...registerEdit('firstName')} />
                 {editErrors.firstName && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{editErrors.firstName.message}</p>}
               </div>
               {/* LastName Input */}
               <div>
                 <div className="mb-2 block"><Label htmlFor="edit-lastName">Last Name</Label></div>
                 <TextInput id="edit-lastName" placeholder="last name" color={editErrors.lastName ? 'failure' : 'gray'} {...registerEdit('lastName')} />
                 {editErrors.lastName && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{editErrors.lastName.message}</p>}
               </div>
              {/* Role Select */}
              <div>
                <div className="mb-2 block"><Label htmlFor="edit-role">Role *</Label></div>
                <Select id="edit-role" required color={editErrors.role ? 'failure' : 'gray'} {...registerEdit('role')}>
                  {Object.values(Role).map((roleValue) => (
                    <option key={roleValue} value={roleValue}>{roleValue}</option>
                  ))}
                </Select>
                {editErrors.role && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{editErrors.role.message}</p>}
              </div>
              {/* IsActive Toggle Switch */}
              <div>
                <Controller
                  name="isActive"
                  control={controlEdit}
                  render={({ field: { onChange, value, name, ref } }) => (
                    <ToggleSwitch
                      id={name}
                      name={name}
                      label="Active Status"
                      checked={value ?? true}
                      onChange={onChange}
                      ref={ref}
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

      {/* Create User Modal Rendering */}
      <CreateUserModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={onCreateSubmit} // Pass the final handler function
        isLoading={isCreatingUser} // Pass the loading state
      />

    </div>
  );
}