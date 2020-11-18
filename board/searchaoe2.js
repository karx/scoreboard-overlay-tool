async function searchAoE2(searchname) {
    let aoe2SearchResult = await fetch(`https://cors-anywhere.herokuapp.com/https://aoe2.net/api/leaderboard?game=aoe2de&leaderboard_id=3&start=1&count=10&search=${searchname}`);
    console.log(aoe2SearchResult);
    return aoe2SearchResult.json();
}