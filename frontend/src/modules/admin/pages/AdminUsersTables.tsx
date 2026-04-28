import {useEffect, useState} from "react";
import {
    Alert,
    Box,
    Typography
} from "@mui/material";

import {getUsers, updateRole} from "../../../api/adminApi.ts";
import type {User} from "../../../types/user/user.ts";
import {DataGrid} from "@mui/x-data-grid";
import {type Role, ROLES} from "../../../config/roles/roles.ts";

const AdminUsersTables = () => {
    const [error, setError] = useState<string | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);


    const columns = [
        { field: 'userId', headerName: 'ID', width: 90  },
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

    useEffect(() => {
        getUsers().then((resp)=> setUsers(resp))
            .catch((err)=>setError(err instanceof Error ? err.message : 'Unknown error'))
            .finally(() => setLoading(false));

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

                            if(Object.values(ROLES).includes(newRow.role.trim().toUpperCase() as Role)){
                                newRow.role = newRow.role.trim().toUpperCase() as Role;
                                await updateRole(newRow);
                                setError(null);

                                setUsers((prev) =>
                                    prev.map((u) =>
                                        u.userId === newRow.userId ? { ...u, role: newRow.role } : u
                                    )
                                );


                                return newRow;
                            }
                            throw new Error("Invalid role. Allowed roles: " + Object.values(ROLES));

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
