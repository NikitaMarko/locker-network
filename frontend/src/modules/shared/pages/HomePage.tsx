import { Link } from 'react-router-dom';
import { useAuth } from '../../../app/providers/useAuth';
import {useRef, useState} from 'react';
import bg from '/smart-locker-project.jpeg';
import { Paths } from "../../../app/utils/paths.ts";

interface AsyncOperation{
    operationId: string;
    operationStatus: string;
    timestamp?: string;
    errorMessage?: string;
}
const COLOR_STATUS:Record<string, string> = {
    PENDING: 'orange',
    FAILED: 'red',
    SUCCESS: 'lightgreen',
    IN_PROGRESS: '#29b6f6'
}

export function HomePage() {

    const { user } = useAuth();
    const [health, setHealth] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [asyncLoading, setAsyncLoading] = useState(false);
    const [count, setCount] = useState(0);
    const[asyncOperation, setAsyncOperation] = useState<AsyncOperation|null>(null);
    const [activeMode, setActiveMode] = useState<'sync' | 'async' | null>(null);
    const isPollingRef = useRef<boolean>(false);

    // const HEALTH_URL = 'http://localhost:3555/health';
    // const HEALTH_URL = 'http://locker-lb-823207158.eu-north-1.elb.amazonaws.com/health';
    const HEALTH_URL = 'https://d31p0ponhhqgks.cloudfront.net/health';
    const ASYNC_STATUS_HEALTH_POST_URL = 'https://d31p0ponhhqgks.cloudfront.net/operation/health';
    const ASYNC_STATUS_HEALTH_GET_URL = (id:string)=>`https://d31p0ponhhqgks.cloudfront.net/operation/${id}`;

    const MAX_ATTEMPTS = 12;
    const POLLING_INTERVAL = 5000;

    const normalizeStatus = (status: string) => {
        if (status === 'ok') return 'UP';
        if (status === 'error') return 'DOWN';
        return status;
    };

    //=============Sync work

    const handleHealthCheck = async () => {
        setActiveMode('sync');
        setAsyncOperation(null);
        try {
            setLoading(true);

            const res = await fetch(HEALTH_URL);

            if (!res.ok) {
                throw new Error(`HTTP error: ${res.status}`);
            }

            const data = await res.json();

            setHealth({
                ...data,
                status: normalizeStatus(data.status),
            });

        } catch (err: any) {
            console.error('Health check failed:', err);

            setHealth({
                status: 'DOWN',
                message: err?.message || 'Server unreachable'
            });
        } finally {
            setLoading(false);
        }
    };

    //=============Async work

    const handleAsyncHealthCheck = async () => {
        if(isPollingRef.current) return;
        setActiveMode('async');
        setHealth(null);
        try{
            setAsyncLoading(true);
            setAsyncOperation(null);
            setCount(0);
            isPollingRef.current = true;

            const initRes = await fetch(ASYNC_STATUS_HEALTH_POST_URL, {method: 'POST'});
            const initData = await initRes.json();

            if(!initData.success) {
                throw new Error('Failed to start health check');
            }
            const {operationId, operationStatus} = initData.data;
            setAsyncOperation({operationId, operationStatus});
            setAsyncLoading(false);
            pollStatus(operationId, 1);

        }catch(err:any){
            setAsyncOperation({operationId: '', operationStatus:'FAILED', errorMessage:err?.message});
            setAsyncLoading(false);
            isPollingRef.current = false;
        }
    };

    const pollStatus = async(operId:string, attempt:number) => {
        if(!isPollingRef.current) return;
        setCount(attempt);
        if(attempt > MAX_ATTEMPTS){
            setAsyncOperation(prev=>prev ? {...prev,operationStatus:'TIMEOUT'}:null);
            isPollingRef.current = false;
            return;
        }
        try{
            const res = await fetch(ASYNC_STATUS_HEALTH_GET_URL(operId));
            if (res.status === 404){
                throw new Error("Operation not found");
            }
            const result = await res.json();
            const op:AsyncOperation = result.data;
            setAsyncOperation(op);
            if (op.operationStatus === 'SUCCESS' || op.operationStatus === 'FAILED') {
                isPollingRef.current = false;
                } else {

                setTimeout(() => pollStatus(operId, attempt + 1), POLLING_INTERVAL);
            }

        } catch (err: any) {
           setAsyncOperation(prev=>prev ? {...prev, operationStatus:'FAILED', errorMessage:err.message}:null);
            isPollingRef.current = false;
        }
    };

    const getStatusColor = () => {
        if (!health?.status) return 'white';

        switch (health.status) {
            case 'UP':
                return 'lightgreen';
            case 'DOWN':
                return '#e53935';
            default:
                return 'orange';
        }
    };

    const buttonStyle = {
        padding: "12px 24px",
        fontSize: "16px",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer",
        backgroundColor: "#4CAF50",
        color: "white",
        textDecoration: "none",
        whiteSpace: "nowrap",
    };

    const isPolling = isPollingRef.current;
    const isFailed = asyncOperation?.operationStatus === 'FAILED';
    const isTimeout = asyncOperation?.operationStatus === 'TIMEOUT';


    return (
        <div
            style={{
                height: "100vh",
                width: "100%",
                overflow: "hidden",
                backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${bg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",

                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",

                fontFamily: "Arial, sans-serif",
                color: "white",
                textAlign: "center",

                paddingTop: "250px",
                paddingLeft: "20px",
                paddingRight: "20px",
                boxSizing: "border-box",
            }}
        >
            {/* HEADER */}
            <h1 style={{
                fontSize: "50px",
                marginBottom: "5px",
                color: "#ffffff",
                letterSpacing: "1px"
            }}>
                Smart Locker System
            </h1>

            <h3 style={{
                fontSize: "38px",
                marginBottom: "25px",
                color: "#ffffff",
                letterSpacing: "1px"
            }}>
                Smart Storage. Zero Hassle.
            </h3>

            {/* CONTENT */}
            <div style={{ maxWidth: "600px" }}>
                <p style={{
                    fontSize: "18px",
                    marginBottom: "25px",
                    lineHeight: "1.6"
                }}>
                    Store and collect your items anytime with our secure
                    smart locker system — fast, contactless, and always available
                    when you need it.
                </p>

                {/* BUTTONS */}
                <div style={{
                    display: "flex",
                    gap: "15px",
                    justifyContent: "center",
                    flexWrap: "wrap",
                    marginBottom: "20px"
                }}>
                    {user ? (
                        <Link to="/redirect-by-role" style={buttonStyle}>
                            Go to dashboard
                        </Link>
                    ) : (
                        <Link to={Paths.LOGIN} style={buttonStyle}>
                            Get started
                        </Link>
                    )}

                    <button
                        onClick={handleHealthCheck}
                        style={buttonStyle}
                        disabled={loading}
                    >
                        {loading ? 'Checking...' : 'Sync Health Check'}
                    </button>
                </div>
                <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
                    <button
                        onClick={handleAsyncHealthCheck}
                        style={{ ...buttonStyle, backgroundColor: asyncLoading || isPolling ? '#555' : '#4CAF50', cursor: asyncLoading || isPolling ? 'not-allowed' : 'pointer' }}
                        disabled={asyncLoading || isPolling}
                    >
                        {asyncLoading
                            ? 'IN_PROGRESS' : isPolling ? `Polling(${count}/${MAX_ATTEMPTS})...` : 'Async Health Check'}
                    </button>
                </div>


                {/* HEALTH */}
                {activeMode === "sync" && health && !loading && (
                    <div style={{
                        marginTop: "15px",
                        padding: "15px",
                        borderRadius: "10px",
                        background: "rgba(255,255,255,0.12)",
                        backdropFilter: "blur(4px)"
                    }}>
                        <p style={{ color: getStatusColor(), fontWeight: 'bold' }}>
                            Status: {health.status}
                        </p>

                        {health.uptime && <p>Uptime: {health.uptime}s</p>}

                        {health.services?.lambda && (
                            <p>
                                Lambda: {health.services.lambda.status}
                            </p>
                        )}

                        {health.services?.database && (
                            <p>
                                DB: {health.services.database.status}
                                {health.services.database.latencyMs && (
                                    <> ({health.services.database.latencyMs} ms)</>
                                )}
                            </p>
                        )}

                        {health.message && <p>{health.message}</p>}
                    </div>
                )}
                {activeMode === 'async' && asyncOperation && (
                    <div style={{ marginTop: "12px", padding: "15px", borderRadius: "10px", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(4px)", justifyContent: "center" }}>
                        {/*<p style={{ fontWeight: 'bold', marginBottom: '6px' }}> Async Operation</p>*/}

                        {asyncOperation.operationId && (
                            <p style={{ fontSize: '11px', opacity: 0.6, marginBottom: '6px' }}>
                                operationId: {asyncOperation.operationId}
                            </p>
                        )}

                        <p style={{
                            color: COLOR_STATUS[asyncOperation.operationStatus] ?? 'orange',
                            fontWeight: 'bold',
                            fontSize: '18px',
                        }}>
                            operationStatus: {asyncOperation.operationStatus}
                        </p>

                        {asyncOperation.timestamp && (
                            <p style={{ fontSize: '15px', opacity: 0.7, marginTop: '4px' }}>
                                timestamp: {asyncOperation.timestamp}
                            </p>
                        )}

                        {asyncOperation.errorMessage && (
                            <p style={{ color: '#e53935', fontSize: '15px', marginTop: '4px' }}>
                                error: {asyncOperation.errorMessage}
                            </p>
                        )}
                        {(isFailed || isTimeout) && (
                            <p style={{
                                fontSize: '15px',
                                opacity: 0.75,
                                marginTop: '8px',
                                borderTop: '1px solid rgba(255,255,255,0.15)',
                                paddingTop: '8px',
                            }}>
                                {isTimeout
                                ? 'Time expired - no response received'
                                : 'Something went wrong - please try again'}
                            </p>
                        )}
                    </div>
                )}


            </div>
        </div>
    );
}