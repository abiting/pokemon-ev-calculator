
async function testAbility() {
  try {
    const response = await fetch('https://pokeapi.co/api/v2/ability/intimidate');
    const data = await response.json();
    
    const zhHantName = data.names.find(
      (n) => n.language.name === 'zh-Hant'
    );
    
    console.log('Ability: intimidate');
    console.log('zh-Hant found:', zhHantName);
    // console.log('All names:', data.names.map(n => `${n.language.name}: ${n.name}`));
  } catch (error) {
    console.error('Error:', error);
  }
}

testAbility();
