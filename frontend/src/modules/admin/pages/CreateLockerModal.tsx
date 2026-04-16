import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button, MenuItem, Stack } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import type { LockerSize } from '../../../types/lockers/lockers.ts';
import {stationsApi} from "../../../api/stationsApi.ts";

interface CreateLockerModalProps {
    open: boolean;
    stationId: string;
    onClose: () => void;
    onSuccess: () => void;
}

const modalStyle = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 3,
};

const CreateLockerModal: React.FC<CreateLockerModalProps> = ({ open, stationId, onClose, onSuccess }) => {
    const queryClient = useQueryClient();
    const [code, setCode] = useState('');
    const [size, setSize] = useState<LockerSize>('S');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await stationsApi.addLocker({ stationId, code, size });
            queryClient.invalidateQueries({ queryKey: ['lockers', stationId] });
            onSuccess();
            onClose();
            setCode('');
        } catch (error) {
            console.error(error);
            alert('Error creating box');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={modalStyle}>
                <Typography variant="h6" fontWeight={700} mb={3}>Add New Locker Box</Typography>
                <form onSubmit={handleSubmit}>
                    <Stack spacing={3}>
                        <TextField
                            label="Box Code (e.g. A-101)"
                            fullWidth
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                        />
                        <TextField
                            select
                            label="Size"
                            value={size}
                            fullWidth
                            onChange={(e) => setSize(e.target.value as LockerSize)}
                        >
                            <MenuItem value="S">Small (S)</MenuItem>
                            <MenuItem value="M">Medium (M)</MenuItem>
                            <MenuItem value="L">Large (L)</MenuItem>

                        </TextField>
                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={loading || !code}
                        >
                            {loading ? 'Adding...' : 'Add Box'}
                        </Button>
                    </Stack>
                </form>
            </Box>
        </Modal>
    );
};

export default CreateLockerModal;