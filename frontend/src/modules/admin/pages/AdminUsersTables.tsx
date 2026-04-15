import {useEffect, useState} from "react";
import {
    Alert,
    Box,
    Typography
} from "@mui/material";

import {getUsers, updateRole} from "../../../api/adminApi.ts";
import type {User} from "../../../types/user/user.ts";
import {DataGrid} from "@mui/x-data-grid";

const AdminUsersTables = () => {
    const [error, setError] = useState<string | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);


    const columns = [
        { field: 'id', headerName: 'ID', width: 90  },
        { field: 'email', headerName: 'Email', flex: 1 },
        // { field: 'password', headerName: 'Password', width: 150 },
        { field: 'phone', headerName: 'Phone', width: 110 },
        { field: 'bookings', headerName: 'Bookings', flex: 1  },
        { field: 'role', headerName: 'Role', width: 150  ,editable: true},
        // { field: 'passwordChangedAt', headerName: 'Password ChangedAt', width: 90 },
        // { field: 'createdAt', headerName: 'Created At', width: 90 },
        // { field: 'updatedAt', headerName: 'Update dAt', width: 90 } ,
        // { field: 'isDeleted', headerName: 'Is Deleted', width: 90 },
        // { field: 'deletedAt', headerName: 'Delete dAt', width: 90 } ,

    ];


    // const mockUsers: User[] = [
    //     {
    //         userId: "1",
    //         name:"asd",
    //         email: "admin@test.com",
    //         phone: "+972501112233",
    //         role: "ADMIN",
    //         isDeleted: false,
    //         createdAt: "2025-01-10T10:00:00Z",
    //         updatedAt: "2025-02-01T12:00:00Z",
    //     },
    //     {
    //         userId: "2",
    //         name:"asd",
    //         email: "user@test.com",
    //         phone: "+972509998877",
    //         role: "USER",
    //         isDeleted: false,
    //         createdAt: "2025-03-15T09:30:00Z",
    //         updatedAt: "2025-03-20T11:45:00Z",
    //     },
    // ];


    useEffect(() => {

        getUsers().then((resp)=> setUsers(resp))
            .catch((err)=>setError(err instanceof Error ? err.message : 'Unknown error'))
            .finally(() => setLoading(false));

        // setUsers(mockUsers)
        // setLoading(false)
    }, []);

    return (
        <>
            <Box sx={{ maxWidth: '1100px', mx: 'auto', mt: 4 }}>
                <Typography
                    variant="h4"
                    fontWeight={900}
                    textAlign="center"
                    mb={4}
                >
                    Users
                </Typography>

                <DataGrid
                    rows={users}
                    columns={columns}
                    loading={loading}
                    editMode="row"
                    getRowId={(row) => row.userId}
                    pageSizeOptions={[5, 10, 20]}
                    disableRowSelectionOnClick
                    processRowUpdate={async (newRow, oldRow) => {
                        try {
                            const updatedUser = await updateRole(newRow);
                            setUsers((prev) =>
                                prev.map((u) =>
                                    u.userId === updatedUser.userId ? updatedUser : u
                                )
                            );

                            return updatedUser;
                        } catch (err) {
                            setError(
                                err instanceof Error ? err.message : "Update failed"
                            );
                            return oldRow;
                        }
                    }}
                    onProcessRowUpdateError={(err) => {
                        setError(
                            err instanceof Error ? err.message : "Update error"
                        );
                    }}
                />
            </Box>

            {error && (
                <Box sx={{ maxWidth: '1100px', mx: 'auto', mt: 2 }}>
                    <Alert severity="error">{error}</Alert>
                </Box>
            )}
        </>
    );
};

export default AdminUsersTables;
