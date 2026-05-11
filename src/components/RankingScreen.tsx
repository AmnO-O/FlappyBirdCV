import {ScreenType} from './ScreenType.tsx'

interface RankingProps{
    navigate : (target : ScreenType) => void
}

function RankingScreen({navigate} : RankingProps){
    return (
        <div className="screen-container">
            <h1 className="section-title">Top Rankings</h1>
            <div className="ranking-board">
            <div className="ranking-item"><span>#1</span><span>Alex</span><span>320</span></div>
            {/* Map data thêm ở đây */}
            </div>
            <button className="back-button" onClick={() => navigate(ScreenType.MAIN_MENU)}>Back</button>
        </div>
    )
}

export default RankingScreen;