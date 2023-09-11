import { Col, Container, Row } from 'react-bootstrap';
import Image from 'next/image';
import { NextSeo } from 'next-seo';
import PropTypes from 'prop-types';
import styles from '@/styles/modules/credits.module.scss';
import ENV from '@/lib/constants/environmentVariables';
import { withSession } from '@/lib/iron-session';
import prisma from '@/lib/db';
import Contributor from '@/components/credits/Contributor';

export const getServerSideProps = withSession(async ({ req }) => {
  const username = req.session?.username;

  if (!username) {
    return {
      props: {
        name_on_riitag: 'You',
      },
    };
  }

  const accountInfo = await prisma.user.findFirst({
    where: {
      username,
    },
    select: {
      name_on_riitag: true,
    },
  });

  return { props: { name_on_riitag: accountInfo.name_on_riitag } };
});

function CreditsPage({ name_on_riitag }) {
  return (
    <Container>
      <NextSeo
        title="Credits"
        openGraph={{
          url: `${ENV.BASE_URL}/credits`,
        }}
      />
      <Row className="mb-3">
        <Col xs={9}>
          <p className="h2">Without these people, RiiTag would not exist:</p>
          <ul>
            <Contributor name="Artuto">
              Added RiiTag support to the RiiConnect24 Bot
            </Contributor>
            <Contributor name="bendevnull">
              One of the main developers and designers of RiiTag
            </Contributor>
            <Contributor name="blackb0x">
              Added official RiiTag support to his modification of USB Loader GX
            </Contributor>
            <Contributor name="Brawl345" link="https://wiidatabase.de">
              Completely rewrote RiiTag into version 2.0 (RiiTag-Next)
            </Contributor>
            <Contributor name="daileon">
              Created Wiinnertag (no longer available), which heavily inspired
              RiiTag
            </Contributor>
            <Contributor name="dhtdht020">
              Created some of the RiiTag overlays
            </Contributor>
            <Contributor name="DismissedGuy">
              Created RiiTag-RPC for Discord
            </Contributor>
            <Contributor name="DLEDeviant">
              Created the font&nbsp;
              <a
                href="https://www.deviantart.com/dledeviant/art/Nintendo-U-Version-3-595000916"
                target="_blank"
                rel="external noopener noreferrer"
              >
                Nintendo U Version 3
              </a>
              , one of the selectable fonts.
            </Contributor>
            <Contributor name="fledge68">
              Added RiiTag support to WiiFlow Lite
            </Contributor>
            <Contributor name="Genwald">Mii support</Contributor>
            <Contributor name="HEYimHeroic">Mii support</Contributor>
            <Contributor name="jaames">
              Figured out how to decrypt Mii QR codes
            </Contributor>
            <Contributor name="Larsenv">
              One of the main developers of the project and brought it to life
            </Contributor>
            <Contributor name="Lustar">
              Creator and owner of GameTDB; the database of games that RiiTag
              uses, also came up with the name RiiTag
            </Contributor>
            <Contributor name="Matthe815">
              Additional for the project
              {Math.floor(Math.random() * 100_000) === 1
                ? ' (and dominating the entire world!)'
                : ''}
            </Contributor>
            <Contributor name="PF2M">Mii support</Contributor>
            <Contributor name="ShadowPuppet">
              Created DUTag (no longer available), which heavily inspired RiiTag
            </Contributor>
            <Contributor name="TheShadowEevee">
              Additional developer of the project, and helped add Cemu and Citra
              support
            </Contributor>
            <Contributor name="twosecslater">
              Created U-Tag, the RiiTag plugin for Wii U
            </Contributor>
            <Contributor
              name={
                name_on_riitag === 'You' ? 'You' : `${name_on_riitag} (You)`
              }
            >
              For using RiiTag!
            </Contributor>
          </ul>
        </Col>
        <Col xs={3} className="text-end">
          <Image
            className={`${styles.spin} no-shadow`}
            alt="Star"
            width={104}
            height={104}
            unoptimized
            src="/star.png"
          />
        </Col>
      </Row>
      <Row className="mb-3">
        <Col className="text-center">
          <p className="h3">Thank You!</p>
        </Col>
      </Row>
    </Container>
  );
}

CreditsPage.propTypes = {
  name_on_riitag: PropTypes.string,
};

CreditsPage.defaultProps = {
  name_on_riitag: 'You',
};

export default CreditsPage;
