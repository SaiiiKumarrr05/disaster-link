"""
Seeds the database with realistic demo data: alerts, risk indicators,
places (shelters/hospitals/police), emergency contacts, guidance topics,
and one account per role for live demo login.

Run with: python -m app.db.seed
"""
from datetime import datetime, timedelta, timezone

from app.core.security import hash_password
from app.db.session import Base, SessionLocal, engine

# Import every model module so its table registers on Base.metadata before
# create_all() runs below. Routers each import only the models they need,
# so without this explicit import list here, tables like sos_requests or
# sos_status_history can be silently skipped at create_all() time.
from app.models.alert import Alert, RiskIndicator
from app.models.content import EmergencyContact, GuidanceTopic
from app.models.enums import (
    AlertSeverity,
    DisasterType,
    PlaceType,
    ShelterCapacityStatus,
    UserRole,
)
from app.models.place import Place
from app.models.profile import Profile
from app.models.sos import SOSRequest, SOSStatusHistory  # noqa: F401


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        if db.query(Profile).count() > 0:
            print("Database already seeded. Skipping.")
            return

        # ---------- Demo accounts (one per role) ----------
        demo_accounts = [
            Profile(
                full_name="Lakshmi Devi",
                phone="9000000001",
                role=UserRole.citizen,
                preferred_language="hi",
                district="Patna",
                state="Bihar",
                hashed_password=hash_password("demo1234"),
            ),
            Profile(
                full_name="Inspector Ravi Kumar",
                phone="9000000002",
                role=UserRole.rescue_team,
                preferred_language="en",
                rescue_unit_name="NDRF Unit 4",
                district="Ernakulam",
                state="Kerala",
                hashed_password=hash_password("demo1234"),
            ),
            Profile(
                full_name="Dr. Meena Iyer",
                phone="9000000003",
                role=UserRole.authority,
                preferred_language="en",
                district="Ernakulam",
                state="Kerala",
                hashed_password=hash_password("demo1234"),
            ),
        ]
        db.add_all(demo_accounts)
        db.commit()
        authority = demo_accounts[2]

        # ---------- Alerts ----------
        now = datetime.now(timezone.utc)
        flood_alert = Alert(
            title="Flood Warning — Periyar River Basin",
            description=(
                "Water levels in the Periyar river basin have crossed the danger mark following "
                "continuous heavy rainfall. Low-lying areas in Ernakulam district are at risk. "
                "Residents are advised to move to higher ground or designated shelters."
            ),
            disaster_type=DisasterType.flood,
            severity=AlertSeverity.critical,
            issuing_authority="Central Water Commission",
            affected_state="Kerala",
            affected_district="Ernakulam",
            latitude=9.9816,
            longitude=76.2999,
            radius_km=15,
            is_active=True,
            issued_at=now - timedelta(hours=2),
            created_by=authority.id,
        )
        cyclone_alert = Alert(
            title="Cyclone Advisory — East Coast",
            description=(
                "A depression in the Bay of Bengal is likely to intensify into a cyclonic storm "
                "within 48 hours. Coastal districts of Tamil Nadu and Andhra Pradesh should monitor "
                "official updates closely."
            ),
            disaster_type=DisasterType.cyclone,
            severity=AlertSeverity.warning,
            issuing_authority="India Meteorological Department",
            affected_state="Tamil Nadu",
            affected_district=None,
            latitude=13.0827,
            longitude=80.2707,
            radius_km=100,
            is_active=True,
            issued_at=now - timedelta(hours=6),
            created_by=authority.id,
        )
        heat_advisory = Alert(
            title="Heatwave Advisory",
            description=(
                "Maximum temperatures are likely to remain 4-5°C above normal over the next three "
                "days. Avoid outdoor activity between noon and 4 PM. Stay hydrated."
            ),
            disaster_type=DisasterType.heatwave,
            severity=AlertSeverity.advisory,
            issuing_authority="India Meteorological Department",
            affected_state="Bihar",
            affected_district="Patna",
            latitude=25.5941,
            longitude=85.1376,
            radius_km=50,
            is_active=True,
            issued_at=now - timedelta(hours=10),
            created_by=authority.id,
        )
        db.add_all([flood_alert, cyclone_alert, heat_advisory])
        db.commit()

        # ---------- Risk indicators ----------
        db.add_all([
            RiskIndicator(alert_id=flood_alert.id, indicator_type="flood_level_m", value=4.2, unit="m", trend="rising"),
            RiskIndicator(alert_id=flood_alert.id, indicator_type="rainfall_mm", value=128, unit="mm/24h", trend="rising"),
            RiskIndicator(alert_id=cyclone_alert.id, indicator_type="wind_speed_kmh", value=78, unit="km/h", trend="rising"),
            RiskIndicator(alert_id=heat_advisory.id, indicator_type="temperature_c", value=44.5, unit="°C", trend="stable"),
        ])

        # ---------- Places (Ernakulam, Kerala area — matches flood alert for demo coherence) ----------
        places = [
            Place(name="Govt. Higher Secondary School Relief Camp", place_type=PlaceType.shelter,
                  latitude=9.9931, longitude=76.2871, address="MG Road, Ernakulam",
                  phone="0484-2345001", capacity_total=300, capacity_occupied=140,
                  capacity_status=ShelterCapacityStatus.open),
            Place(name="Town Hall Community Shelter", place_type=PlaceType.shelter,
                  latitude=9.9756, longitude=76.2841, address="Town Hall Rd, Ernakulam",
                  phone="0484-2345002", capacity_total=200, capacity_occupied=190,
                  capacity_status=ShelterCapacityStatus.limited),
            Place(name="St. Xavier's College Relief Center", place_type=PlaceType.shelter,
                  latitude=9.9678, longitude=76.3012, address="Kaloor, Ernakulam",
                  phone="0484-2345003", capacity_total=150, capacity_occupied=150,
                  capacity_status=ShelterCapacityStatus.full),
            Place(name="General Hospital Ernakulam", place_type=PlaceType.hospital,
                  latitude=9.9833, longitude=76.2833, address="Hospital Rd, Ernakulam",
                  phone="0484-2360002"),
            Place(name="Lakeshore Hospital", place_type=PlaceType.hospital,
                  latitude=9.9534, longitude=76.2912, address="Maradu, Ernakulam",
                  phone="0484-2701032"),
            Place(name="Ernakulam Central Police Station", place_type=PlaceType.police_station,
                  latitude=9.9789, longitude=76.2856, address="Park Avenue Rd, Ernakulam",
                  phone="0484-2360100"),
            Place(name="Marine Drive Police Outpost", place_type=PlaceType.police_station,
                  latitude=9.9745, longitude=76.2789, address="Marine Drive, Ernakulam",
                  phone="0484-2360150"),
        ]
        db.add_all(places)

        # ---------- Emergency contacts ----------
        contacts = [
            EmergencyContact(label="National Disaster Helpline", phone_number="1078", scope="national", display_order=1),
            EmergencyContact(label="NDRF", phone_number="011-24363260", scope="national", display_order=2),
            EmergencyContact(label="Police", phone_number="100", scope="national", display_order=3),
            EmergencyContact(label="Ambulance", phone_number="108", scope="national", display_order=4),
            EmergencyContact(label="Fire Service", phone_number="101", scope="national", display_order=5),
            EmergencyContact(label="Kerala SDMA Control Room", phone_number="0471-2364424", scope="state", state="Kerala", display_order=6),
        ]
        db.add_all(contacts)

        # ---------- Guidance topics (bilingual) ----------
        topics = [
            GuidanceTopic(
                topic_key="earthquake_now",
                title_en="Earthquake — what to do right now",
                title_hi="भूकंप — अभी क्या करें",
                disaster_type=DisasterType.earthquake,
                steps_en=[
                    "Drop, Cover, and Hold On — get under a sturdy table or against an interior wall.",
                    "Stay away from windows, mirrors, and tall furniture that can fall.",
                    "If outdoors, move to an open area away from buildings and power lines.",
                    "If indoors, do not run outside during the shaking — most injuries happen while moving.",
                    "After shaking stops, check yourself and others for injuries before moving.",
                    "Expect aftershocks. If your building is damaged, evacuate calmly and go to an open area.",
                ],
                steps_hi=[
                    "झुकें, ढकें और पकड़ें — किसी मजबूत मेज के नीचे या भीतरी दीवार के सहारे बैठें।",
                    "खिड़कियों, शीशों और ऊँचे फर्नीचर से दूर रहें जो गिर सकते हैं।",
                    "बाहर हों तो इमारतों और बिजली लाइनों से दूर खुले क्षेत्र में जाएं।",
                    "घर के अंदर हों तो हिलने के दौरान बाहर न भागें — अधिकतर चोटें चलते समय लगती हैं।",
                    "हिलना बंद होने के बाद, हिलने से पहले खुद की और दूसरों की चोटों की जांच करें।",
                    "बाद के झटकों की आशंका रहती है। यदि इमारत क्षतिग्रस्त है, तो शांति से बाहर खुले क्षेत्र में जाएं।",
                ],
            ),
            GuidanceTopic(
                topic_key="flood_warning",
                title_en="Flood warning — immediate steps",
                title_hi="बाढ़ की चेतावनी — तुरंत क्या करें",
                disaster_type=DisasterType.flood,
                steps_en=[
                    "Move to higher ground immediately — do not wait for water to rise further.",
                    "Avoid walking or driving through flowing water — 15cm of moving water can knock you down.",
                    "Switch off mains electricity and gas if it is safe to do so before leaving.",
                    "Carry essential medicines, ID documents, and drinking water if you evacuate.",
                    "Use the Shelter Finder to locate your nearest relief camp.",
                    "If trapped, use the SOS button to share your exact location with rescue teams.",
                ],
                steps_hi=[
                    "तुरंत ऊँचे स्थान पर जाएं — पानी और बढ़ने का इंतजार न करें।",
                    "बहते पानी में पैदल या वाहन से न चलें — 15 सेमी बहता पानी भी गिरा सकता है।",
                    "घर छोड़ने से पहले, यदि सुरक्षित हो तो मुख्य बिजली और गैस बंद कर दें।",
                    "निकलते समय जरूरी दवाइयां, पहचान पत्र और पीने का पानी साथ रखें।",
                    "अपने नज़दीकी राहत शिविर का पता लगाने के लिए शेल्टर फाइंडर का उपयोग करें।",
                    "फंसे होने पर, अपनी सटीक स्थिति बचाव दल तक पहुंचाने के लिए SOS बटन का उपयोग करें।",
                ],
            ),
            GuidanceTopic(
                topic_key="gas_leak",
                title_en="Suspected gas leak",
                title_hi="गैस लीक की आशंका",
                disaster_type=DisasterType.other,
                steps_en=[
                    "Do not switch on or off any electrical switch — even small sparks can ignite gas.",
                    "Open doors and windows immediately to ventilate the area.",
                    "Turn off the gas cylinder/mains valve if you can reach it safely.",
                    "Leave the building and move others away from the area.",
                    "Call the fire service (101) or use SOS once you are at a safe distance.",
                    "Do not re-enter until authorities confirm it is safe.",
                ],
                steps_hi=[
                    "किसी भी बिजली के स्विच को चालू या बंद न करें — छोटी सी चिंगारी भी गैस जला सकती है।",
                    "क्षेत्र को हवादार करने के लिए तुरंत दरवाजे और खिड़कियां खोलें।",
                    "यदि सुरक्षित रूप से पहुंच सकें तो गैस सिलेंडर/मुख्य वाल्व बंद करें।",
                    "इमारत से बाहर निकलें और अन्य लोगों को क्षेत्र से दूर ले जाएं।",
                    "सुरक्षित दूरी पर पहुंचने के बाद फायर सर्विस (101) को कॉल करें या SOS का उपयोग करें।",
                    "अधिकारियों द्वारा सुरक्षित पुष्टि होने तक वापस अंदर न जाएं।",
                ],
            ),
            GuidanceTopic(
                topic_key="cyclone_approaching",
                title_en="Cyclone approaching — preparation steps",
                title_hi="चक्रवात आने वाला है — तैयारी के चरण",
                disaster_type=DisasterType.cyclone,
                steps_en=[
                    "Secure loose objects outdoors — furniture, signage, and debris become projectiles in high wind.",
                    "Store at least 3 days of drinking water and non-perishable food.",
                    "Charge phones and power banks fully before the storm reaches your area.",
                    "Identify your nearest cyclone shelter now using the Shelter Finder — do not wait.",
                    "Stay indoors, away from windows, once winds pick up.",
                    "Follow official evacuation orders immediately if issued for your zone.",
                ],
                steps_hi=[
                    "बाहर रखी ढीली वस्तुओं को सुरक्षित करें — तेज हवा में फर्नीचर और मलबा खतरनाक बन जाते हैं।",
                    "कम से कम 3 दिनों का पीने का पानी और सूखा भोजन रखें।",
                    "तूफान आने से पहले फोन और पावर बैंक पूरी तरह चार्ज कर लें।",
                    "अभी शेल्टर फाइंडर का उपयोग करके अपने नज़दीकी चक्रवात आश्रय की पहचान करें — प्रतीक्षा न करें।",
                    "हवा तेज होने पर घर के अंदर, खिड़कियों से दूर रहें।",
                    "अपने क्षेत्र के लिए जारी निकासी आदेशों का तुरंत पालन करें।",
                ],
            ),
            GuidanceTopic(
                topic_key="trapped_need_rescue",
                title_en="Trapped and need rescue",
                title_hi="फंसे हुए हैं और बचाव की जरूरत है",
                disaster_type=None,
                steps_en=[
                    "Send an SOS immediately — your exact GPS location is shared with rescue teams.",
                    "If you have phone signal, keep your phone charged and accessible.",
                    "Make noise periodically — tap on pipes or walls in short bursts to help rescuers locate you.",
                    "Conserve energy and avoid unnecessary movement that could worsen the situation.",
                    "If safe, mark your location visibly (cloth, light) for aerial rescue spotting.",
                    "Stay calm — your SOS status will update as Acknowledged, then En Route.",
                ],
                steps_hi=[
                    "तुरंत SOS भेजें — आपकी सटीक GPS स्थिति बचाव दल के साथ साझा हो जाती है।",
                    "यदि फोन सिग्नल है, तो फोन को चार्ज और पास रखें।",
                    "समय-समय पर आवाज़ करें — पाइप या दीवारों पर छोटी थाप दें ताकि बचाव दल आपको ढूंढ सकें।",
                    "ऊर्जा बचाएं और अनावश्यक हलचल से बचें जो स्थिति बिगाड़ सकती है।",
                    "सुरक्षित हो तो अपनी स्थिति को कपड़े या रोशनी से स्पष्ट रूप से चिह्नित करें।",
                    "शांत रहें — आपकी SOS स्थिति 'स्वीकृत' फिर 'रवाना' के रूप में अपडेट होगी।",
                ],
            ),
            GuidanceTopic(
                topic_key="first_aid_basics",
                title_en="First aid basics",
                title_hi="प्राथमिक उपचार की मूल बातें",
                disaster_type=None,
                steps_en=[
                    "For bleeding: apply firm, direct pressure with a clean cloth until it stops.",
                    "For burns: cool with running water for 10-15 minutes — do not apply ice or ointments.",
                    "For fractures: do not move the injured limb; immobilize it with a splint if available.",
                    "For unconsciousness: check breathing, place in recovery position if breathing normally.",
                    "For shock symptoms (pale, cold, rapid pulse): lay the person down, raise legs slightly, keep warm.",
                    "Always call for medical help via SOS or 108 — first aid buys time, it does not replace treatment.",
                ],
                steps_hi=[
                    "रक्तस्राव के लिए: साफ कपड़े से सीधा दबाव डालें जब तक खून बहना बंद न हो जाए।",
                    "जलने पर: 10-15 मिनट तक बहते पानी से ठंडा करें — बर्फ या क्रीम न लगाएं।",
                    "हड्डी टूटने पर: घायल अंग को न हिलाएं; उपलब्ध हो तो स्प्लिंट से स्थिर करें।",
                    "बेहोशी की स्थिति में: सांस जांचें, सामान्य सांस होने पर रिकवरी पोजीशन में लिटाएं।",
                    "शॉक के लक्षण (पीलापन, ठंडक, तेज़ पल्स) में: व्यक्ति को लिटाएं, पैर थोड़ा ऊँचा करें, गर्म रखें।",
                    "हमेशा SOS या 108 के माध्यम से चिकित्सा सहायता बुलाएं — प्राथमिक उपचार समय देता है, उपचार का विकल्प नहीं है।",
                ],
            ),
        ]
        db.add_all(topics)

        db.commit()
        print("Seed complete: 3 demo accounts, 3 alerts, 7 places, 6 contacts, 6 guidance topics.")
        print("Demo logins (phone / password):")
        print("  Citizen:    9000000001 / demo1234")
        print("  Rescue Team: 9000000002 / demo1234")
        print("  Authority:  9000000003 / demo1234")

    finally:
        db.close()


if __name__ == "__main__":
    seed()
