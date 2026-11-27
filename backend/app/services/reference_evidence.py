"""Small offline reference corpus. Passages are curated paraphrases, not live quotations."""
import re

RECORDS = [
    (r'chandrayaan[ -]?3|vikram lander|pragyan', 'ISRO Chandrayaan-3 mission', 'https://www.isro.gov.in/Chandrayaan3.html', 'Chandrayaan-3 was launched on July 14, 2023 from the Satish Dhawan Space Centre in Sriharikota. The Indian Space Research Organisation (ISRO) developed the mission, including the Vikram lander and Pragyan rover. Chandrayaan-3 successfully soft-landed on the Moon on August 23, 2023.'),
    (r'chandrayaan[ -]?3|vikram lander|pragyan', 'NASA Science Chandrayaan-3', 'https://science.nasa.gov/mission/chandrayaan-3/', 'Chandrayaan-3 is an Indian Space Research Organisation mission that landed near the south pole of the Moon on August 23, 2023. The mission includes a lander and a rover.'),
    (r'chandrayaan[ -]?3|vikram lander|pragyan', 'BBC Chandrayaan-3 landing', 'https://www.bbc.com/news/world-asia-india-66594520', 'India became the fourth country to achieve a soft landing on the Moon when Chandrayaan-3 landed on August 23, 2023.'),
    (r'olympic', 'Paris 2024 Olympic Games', 'https://www.olympics.com/en/olympic-games/paris-2024', 'The 2024 Summer Olympic Games were hosted by Paris, France, from July 26 to August 11, 2024.'),
    (r'earth|gravity', 'NASA Earth facts', 'https://science.nasa.gov/earth/facts/', 'Earth is a planet with a roughly spherical shape, slightly flattened at its poles. Earth has gravity, which holds its atmosphere and keeps objects on its surface.'),
    (r'apollo 11', 'NASA Apollo 11', 'https://www.nasa.gov/mission/apollo-11/', 'Apollo 11 landed humans on the Moon on July 20, 1969. Neil Armstrong and Buzz Aldrin walked on the lunar surface.'),
    (r'aditya[ -]?l1', 'ISRO Aditya-L1', 'https://www.isro.gov.in/Aditya_L1.html', 'ISRO launched Aditya-L1 on September 2, 2023 to study the Sun.'),
    (r'james webb|jwst', 'NASA Webb mission', 'https://science.nasa.gov/mission/webb/', 'The James Webb Space Telescope launched on December 25, 2021 aboard an Ariane 5 rocket. It is a collaboration between NASA, ESA and the Canadian Space Agency and observes the universe in infrared light.'),
]

def search_references(text):
    from urllib.parse import urlsplit
    return [dict(title=title, url=url, source=urlsplit(url).hostname, description=passage, content='', publishedAt='', provider='Offline Reference') for pattern,title,url,passage in RECORDS if re.search(pattern,text,re.I)]
