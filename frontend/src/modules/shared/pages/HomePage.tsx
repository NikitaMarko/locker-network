import { Link } from 'react-router-dom';
import { useAuth } from '../../../app/providers/useAuth';
import {useRef, useState} from 'react';
import bg from '/smart-locker-project.jpeg';
import { Paths } from "../../../app/utils/paths.ts";

export function HomePage() {
    const { user } = useAuth();
    const [health, setHealth] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [asyncLoading, setAsyncLoading] = useState(false);
    const [count, setCount] = useState(0);
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
        try{
            setAsyncLoading(true);
            setHealth(null);
            setCount(0);
            isPollingRef.current = true;

            const initRes = await fetch(ASYNC_STATUS_HEALTH_POST_URL, {method: 'POST'});
            const initData = await initRes.json();

            if(!initData.success) {
                throw new Error('Failed to start health check');
            }
            const operationId = initData.data.operationId;
            pollStatus(operationId, 1);

        }catch(err:any){
            console.error('Init failed:', err);
            setHealth({status: 'DOWN', message: err?.message});
            setAsyncLoading(false);
            isPollingRef.current = false;
        }
    };

    const pollStatus = async(operId:string, attempt:number) => {
        if(!isPollingRef.current) return;
        setCount(attempt);
        if(attempt > MAX_ATTEMPTS){
            setHealth({status: 'DOWN', message: 'the waiting time has expired'})
            setAsyncLoading(false);
            isPollingRef.current = false;
            return;
        }
        try{
            const res = await fetch(ASYNC_STATUS_HEALTH_GET_URL(operId));
            if (res.status === 404){
                throw new Error("Operation not found");
            }
            const result = await res.json();
            const status = result.data.operationStatus;
            if (status === 'SUCCESS' || status === 'FAILED') {

                setHealth({
                    status: status === 'SUCCESS' ? 'UP' : 'DOWN',
                    message: result.data.errorMessage || (status === 'SUCCESS' ? 'System is healthy' : 'Check failed')
                });
                setAsyncLoading(false);
                isPollingRef.current = false;
            } else {

                setTimeout(() => pollStatus(operId, attempt + 1), POLLING_INTERVAL);
            }

        } catch (err: any) {
            setHealth({ status: 'DOWN', message: err.message });
            setAsyncLoading(false);
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
                        style={buttonStyle}
                        disabled={asyncLoading}
                    >
                        {asyncLoading
                            ? `Checking (Try ${count}/${MAX_ATTEMPTS})...`
                            : 'Start Async Health Check'}
                    </button>
                </div>


                {/* HEALTH */}
                {health && !loading && !asyncLoading &&(
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

            </div>
        </div>
    );
}